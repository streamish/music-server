import { FavoritesService } from 'src/favorites/favorites.service';
import { Injectable } from '@nestjs/common';
import { ShoutcastService } from 'src/shoutcast/shoutcast.service';

@Injectable()
export class ApiShoutcastService {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly shoutcastService: ShoutcastService,
  ) {}

  async createStation(accountId: number, url: string, title: string, favorite = false) {
    const station = await this.shoutcastService.createStation(accountId, url, title);
    if (favorite) {
      await this.favoritesService.setShoutcastStationFavorite(accountId, station.id);
    }
    return station;
  }

  async deleteStation(accountId: number, stationId: number) {
    await this.shoutcastService.deleteStation(accountId, stationId);
  }

  async listGenres(accountId: number) {
    const genres = await this.shoutcastService.listGenres(accountId);
    return {
      genres: genres.items,
      offset: 0,
      total: genres.total,
    };
  }

  async listStations(accountId: number) {
    const stations = await this.shoutcastService.listStations(accountId, 0, 100_000);
    return {
      stations: stations.items,
      offset: 0,
      total: stations.total,
    };
  }

  async listOnlineStations(accountId: number, genreId: number) {
    const stations = await this.shoutcastService.listOnlineStations(accountId, genreId);
    return {
      stations: stations.items,
      offset: 0,
      total: stations.total,
    };
  }

  async updateStation(accountId: number, stationId: number, url: string, title: string) {
    await this.shoutcastService.updateStation(accountId, stationId, url, title);
  }
}
