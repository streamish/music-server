import * as http from 'http';
import * as https from 'https';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { ShoutcastItemTypeEnum } from 'src/types/enums';
import { ShoutcastService } from 'src/shoutcast/shoutcast.service';
import { ShoutcastStationEntity } from 'src/database/entities';
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
    @InjectModel(ShoutcastStationEntity)
    private readonly shoutcastStationEntity: typeof ShoutcastStationEntity,
    private readonly shoutcastService: ShoutcastService,
  ) {}

  /**
   * The station identifier can be provided in two distinct formats:
   * 1) `radio_<station title> <station url>`
   * 2) `<container>_<genre> <favorite title>`
   * @param stationIdentifier The station identifier string that contains the stream URL or favorite reference
   * @returns The extracted stream URL from the station identifier
   * @throws If the station identifier is invalid or does not contain a valid stream URL
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
    const favorite = await this.shoutcastStationEntity.findOne({
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
    return this.shoutcastService.retrieveStationCurrentPlaying(streamUrl);
  }

  async proxyStream(streamId: number, clientResponse: Response) {
    const streamEntry = this.streams.find((s) => s.streamId === streamId);
    if (!streamEntry) {
      throw new Error('Invalid stream ID');
    }
    streamEntry.stream.pipe(clientResponse);
  }

  async deleteStream(streamId: number) {
    const streamEntry = this.streams.find((s) => s.streamId === streamId);
    if (streamEntry) {
      streamEntry.stream.destroy();
      this.streams.splice(this.streams.indexOf(streamEntry), 1);
    }
  }
}
