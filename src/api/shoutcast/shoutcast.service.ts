import * as http from 'http';
import * as https from 'https';
import { ErrorCodes } from 'src/constants/error-codes';
import { FavoritesService } from 'src/favorites/favorites.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { ShoutcastService } from 'src/shoutcast/shoutcast.service';
import { promisify } from 'util';

const startStream = promisify((url: string, callback: (error: Error | null, stream?: http.IncomingMessage) => void) => {
  const protocol = url.startsWith('https') ? https : http;
  return protocol.get(url, (response) => {
    response.on('error', (error) => {
      return callback(error);
    });
    response.on('data', (data) => {
      const playlist = data.toString().split('\n');
      const newUrlLine = playlist.find((line: string) => line.startsWith('File'));
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
export class ApiShoutcastService {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly shoutcastService: ShoutcastService,
  ) {}

  /**
   * Adds a SHOUTcast genre to a user.  These genres are defined by SHOUTcast themselves
   * and must be valid according to SHOUTcast's genre definitions.  If they are not valid
   * then there will never be any stations that belong to that genre.
   * @param accountId The authenticated user ID
   * @param name The name of the genre to add
   * @returns The created genre object
   */
  async createGenre(accountId: number, name: string) {
    const genre = await this.shoutcastService.createGenre(accountId, name);
    return genre;
  }

  /**
   * Adds a custom SHOUTcast station to a user.  The station can be optionally set as a
   * favorite at the same time.  Custom stations require a name and a URL, the URL must
   * be valid for the station to work.  The URLs are often in the form of an IP address
   * rather than a domain name, such as `http://123.231.45.67:8000/radio`.
   * @param accountId The authenticated user ID
   * @param url The URL of the custom station
   * @param title The title of the custom station
   * @param favorite Whether to mark the station as a favorite
   * @returns The created station object
   */
  async createStation(accountId: number, url: string, title: string, favorite = false) {
    const station = await this.shoutcastService.createStation(accountId, url, title);
    if (favorite) {
      await this.favoritesService.setShoutcastStationFavorite(accountId, station.id);
    }
    return station;
  }

  /**
   * Deletes a SHOUTcast genre from a user.  This will remove the genre from the user's list
   * of preferred genres.  This will not impact the initial set of genres populated during
   * account creation, or delete a genre from the SHOUTcast system entirely.
   * @param accountId The authenticated user ID
   * @param genreId The ID of the genre to delete
   */
  async deleteGenre(accountId: number, genreId: number) {
    await this.shoutcastService.deleteGenre(accountId, genreId);
  }

  /**
   * Deletes a custom SHOUTcast station from a user.
   * @param accountId The authenticated user ID
   * @param stationId The ID of the station to delete
   */
  async deleteStation(accountId: number, stationId: number) {
    await this.shoutcastService.deleteStation(accountId, stationId);
  }

  /**
   * Lists all SHOUTcast genres for a user.  These are a hard-coded non-definitive list of
   * genres inserted into the database during account creation.
   * @param accountId The authenticated user ID
   * @returns An object containing the list of genres, the offset, and the total count
   */
  async listGenres(accountId: number) {
    const genres = await this.shoutcastService.listGenres(accountId);
    return {
      genres: genres.items,
      offset: 0,
      total: genres.total,
    };
  }

  /**
   * Lists all custom SHOUTcast stations for a user.
   * @param accountId The authenticated user ID
   * @returns An object containing the list of stations, the offset, and the total count
   */
  async listStations(accountId: number) {
    const stations = await this.shoutcastService.listStations(accountId, 0, 100_000);
    return {
      stations: stations.items,
      offset: 0,
      total: stations.total,
    };
  }

  /**
   * Lists the currently-online stations for a genre as reported by SHOUTcast.
   * @param accountId The authenticated user ID
   * @param genreId The ID of the genre to list online stations for
   * @returns An object containing the list of online stations, the offset, and the total count
   */
  async listOnlineStations(accountId: number, genreId: number) {
    const stations = await this.shoutcastService.listOnlineStations(accountId, genreId);
    return {
      stations: stations.items,
      offset: 0,
      total: stations.total,
    };
  }

  /**
   * Proxies a SHOUTcast stream for the given station URL to the client response.
   * @param stationUrl The URL of the SHOUTcast station to create a stream for
   * @param response The HTTP response object to pipe the stream to
   */
  async proxyStream(accountId: number, stationUrl: string, response: Response) {
    const stream = await startStream(stationUrl);
    if (!stream) {
      throw new InternalServerErrorException(ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR);
    }
    await this.shoutcastService.incrementStationPlayCount(accountId, stationUrl);
    stream.pipe(response);
  }

  /**
   * Fetches the current-playing song title from the SHOUTcast stream if it is provided.
   * @param stationUrl The URL of the SHOUTcast station to create a stream for
   * @returns The current-playing song info for the specified stream
   */
  async retrieveCurrentPlaying(stationUrl: string) {
    return this.shoutcastService.retrieveStationCurrentPlaying(stationUrl);
  }

  /**
   * Updates a SHOUTcast genre name.  These genres must match what SHOUTcast themselves have.
   * @param accountId The authenticated user ID
   * @param name The name of the genre to add
   */
  async updateGenre(accountId: number, genreId: number, name: string) {
    await this.shoutcastService.updateGenre(accountId, genreId, name);
  }

  /**
   * Updates a custom-added station if the URL has changed or the title needs to be updated.
   * @param accountId The authenticated user ID
   * @param stationId The ID of the station to update
   * @param url The new URL of the station
   * @param title The new title of the station
   */
  async updateStation(accountId: number, stationId: number, url: string, title: string) {
    await this.shoutcastService.updateStation(accountId, stationId, url, title);
  }
}
