import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumWithTracksDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';

function albumToRow(album: LibraryAlbumWithTracksDto) {
  return {
    id: `album-${album.id}`,
    name: album.title,
    artist: album.artists.map((artist) => artist.name).join(', '),
    songCount: album.tracks.length,
  };
}

@Injectable()
export class SubsonicGetAlbumService {
  constructor(private readonly library: LibraryService) {}

  async getAlbum(accountId: number, albumId: number) {
    const albums = await this.library.retrieveAlbum(accountId, albumId);
    if (!albums || !albums?.[0]) {
      throw new NotFoundException(`Album not found: ${albumId}`);
    }
    return albumToRow(albums[0]);
  }
}
