import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class SubsonicStarredService {
  constructor(private readonly libraryService: LibraryService) {}

  async getStarred(userId: number) {
    const favorites = await this.libraryService.listFavorites(userId, 0, 100_000);
    const artist: Record<string, string | number | Date>[] = [];
    const album: Record<string, string | number | Date>[] = [];
    const song: Record<string, string | number | Date>[] = [];
    for (let i = 0, len = favorites.items.length; i < len; i += 1) {
      const item = favorites.items[i];
      if (item) {
        if (item.association) {
          artist.push({
            id: `${item.association.id}`,
            name: item.association.name,
            coverArt: `${item.association.id}`,
            albumCount: item.association.albums?.length,
            starred: item.createdAt,
          });
        }
        if (item.album) {
          // eslint-disable-next-line no-await-in-loop
          const tracks = await this.libraryService.listTracks(userId, { albumIds: [item.album.id] }, 0, 100_000);
          album.push({
            id: `${item.album.id}`,
            name: item.album.title,
            artist: item.album.artists.map((a) => a.name).join(', '),
            artistId: `${item.album.artists[0]?.id}`,
            year: item.album.year,
            coverArt: `${item.album.id}`,
            songCount: tracks.items.length,
            duration: tracks.items.reduce((sum, track) => sum + track.duration, 0),
            starred: item.createdAt,
          });
        }
        if (item.track) {
          song.push({
            id: `song-${item.track.id}`,
            parent: `${item.track.albumId}`,
            title: item.track.title,
            album: item.track.albumTitle,
            artist: item.track.artists.map((a) => a.name).join(', '),
            albumId: `${item.track.albumId}`,
            artistId: `${item.track.artists[0]?.id}`,
            track: item.track.trackNumber,
            year: item.track.year,
            duration: item.track.duration,
            contentType: `audio/${item.track.fileType}`,
            suffix: item.track.fileType,
            starred: item.createdAt,
          });
        }
      }
    }
    return { artist, album, song };
  }
}
