import * as http from 'http';
import * as https from 'https';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Response } from 'express';
import { ShoutcastContainerEntity, ShoutcastItemEntity } from 'src/database/entities';
import { ShoutcastItemTypeEnum } from 'src/types/enums';
import { promisify } from 'util';

type StreamEntry = {
  streamId: number;
  streamUrl: string;
  stream: http.IncomingMessage;
};

const startStream = promisify((url: string, callback: (error: Error | null, stream?: http.IncomingMessage) => void) => {
  const protocol = url.startsWith('https') ? https : http;
  return protocol.get(url, (response) => {
    response.on('error', (error) => {
      return callback(error);
    });
    response.on('data', (data) => {
      const playlist = data.toString().split('\n');
      const newUrlLine = playlist.find((line) => line.startsWith('File'));
      if (!newUrlLine) {
        return callback(new Error('No stream URL found in playlist'));
      }
      const newUrl = newUrlLine.substring(newUrlLine.indexOf('=') + 1).trim();
      if (!newUrl) {
        return callback(new Error('No stream URL found in playlist'));
      }
      const newProtocol = newUrl.startsWith('https') ? https : http;
      return newProtocol
        .get(newUrl, (stream) => {
          return callback(null, stream);
        })
        .on('error', (error) => {
          return callback(error);
        })
        .end();
    });
  });
});

@Injectable()
export class SynologyProxyService {
  private streamCounter: number = 0;

  private streams: StreamEntry[] = [];

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(ShoutcastContainerEntity)
    private readonly shoutcastContainerEntity: typeof ShoutcastContainerEntity,
    @InjectModel(ShoutcastItemEntity)
    private readonly shoutcastItemEntity: typeof ShoutcastItemEntity,
  ) {}

  /**
   * The station identifier can be provided in two distinct formats:
   * 1) `radio_<station title> <station url>`
   * 2) `<container>_<genre> <favorite title>`
   * @param {string} stationIdentifier The station identifier string that contains the stream URL or favorite reference
   * @returns {string} The extracted stream URL from the station identifier
   * @throws {Error} If the station identifier is invalid or does not contain a valid stream URL
   */
  private async getStreamUrl(stationIdentifier: string) {
    const streamUrl = stationIdentifier.split(' ').pop();
    if (!streamUrl) {
      throw new Error('Invalid station identifier');
    }
    if (streamUrl.startsWith('http')) {
      return streamUrl;
    }
    const favoriteTitle = stationIdentifier.split('_genre_').pop();
    const favorite = await this.shoutcastItemEntity.findOne({
      where: {
        title: favoriteTitle,
        type: ShoutcastItemTypeEnum.STATION,
      },
    });
    if (!favorite || !favorite.url) {
      throw new Error('Stream URL not found for the given station identifier');
    }
    return favorite.url;
  }

  // eslint-disable-next-line class-methods-use-this
  async createStream(stationIdentifier: string) {
    const streamUrl = await this.getStreamUrl(stationIdentifier);
    const existingStream = this.streams.find((s) => s.streamUrl === streamUrl);
    if (!existingStream) {
      const stream = await startStream(streamUrl);
      if (!stream) {
        throw new InternalServerErrorException('Failed to start stream');
      }
      this.streamCounter += 1;
      this.streams.push({ streamId: this.streamCounter, streamUrl, stream });
      stream.on('close', () => {
        this.streams = this.streams.filter((s) => s.streamUrl !== streamUrl);
      });
    }
    return {
      format: 'mp3',
      stream_id: `stream_${this.streams.find((s) => s.streamUrl === streamUrl)?.streamId}`,
    };
  }

  async getCurrentSongInfo(streamId: number) {
    // retrieve the station information
    const streamEntry = this.streams.find((s) => s.streamId === streamId);
    if (!streamEntry) {
      throw new Error('Invalid stream ID');
    }
    const { streamUrl } = streamEntry;
    const url = new URL(streamUrl);
    const stationId = url.searchParams.get('id');
    if (!stationId) {
      throw new Error('Invalid stream URL');
    }
    // retrieve the current song information
    const currentTrackKey = `currentTrack-${stationId}`;
    const cachedCurrentTrack = await this.cacheManager.get<string>(currentTrackKey);
    if (cachedCurrentTrack) {
      return {
        title: cachedCurrentTrack,
      };
    }
    const body = `stationID=${stationId}`;
    const request = await fetch('https://directory.shoutcast.com/Player/GetCurrentTrack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': body.length.toString(),
        Referer: 'https://directory.shoutcast.com/',
      },
      body,
    });
    const response = await request.json();
    this.cacheManager.set(currentTrackKey, response.CurrentTrack, 30);
    return {
      title: response.Station.CurrentTrack,
    };
  }

  async proxyStream(streamId: number, clientResponse: Response) {
    const streamEntry = this.streams.find((s) => s.streamId === streamId);
    if (!streamEntry) {
      throw new Error('Invalid stream ID');
    }
    streamEntry.stream.pipe(clientResponse);
  }

  async deleteSongInfo(streamId: number) {
    const streamEntry = this.streams.find((s) => s.streamId === streamId);
    if (!streamEntry) {
      throw new Error('Invalid stream ID');
    }
    const url = new URL(streamEntry.streamUrl);
    const stationId = url.searchParams.get('id');
    if (stationId) {
      const currentTrackKey = `currentTrack-${stationId}`;
      await this.cacheManager.del(currentTrackKey);
    }
  }

  async deleteStream(streamId: number) {
    const streamEntry = this.streams.find((s) => s.streamId === streamId);
    if (streamEntry) {
      streamEntry.stream.destroy();
      this.streams.splice(this.streams.indexOf(streamEntry), 1);
    }
  }
}
