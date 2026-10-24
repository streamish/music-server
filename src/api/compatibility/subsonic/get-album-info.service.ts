import { ConfigService } from 'src/config/config.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class SubsonicAlbumInfoService {
  constructor(
    private readonly configService: ConfigService,
    private readonly libraryService: LibraryService,
  ) {}

  async getAlbumInfo(userId: number, albumOrTrackId: number) {
    let albumId: number | undefined;
    try {
      const album = await this.libraryService.retrieveAlbum(userId, [albumOrTrackId]);
      albumId = album[0]?.id;
    } catch {
      // If a track ID was provided an exception will be thrown and can be ignored.
    }
    if (!albumId) {
      try {
        const track = await this.libraryService.retrieveTrack(userId, [albumOrTrackId]);
        albumId = track[0]?.albumId;
      } catch {
        // If a track ID was provided an exception will be thrown and can be ignored.
      }
    }
    // If no album ID or track ID belonging to the user was found, throw a NotFoundException
    if (!albumId) {
      throw new NotFoundException(`Album with ID ${albumOrTrackId} not found`);
    }
    return this.getAlbumInfo2(userId, albumId);
  }

  async getAlbumInfo2(userId: number, albumId: number) {
    const album = await this.libraryService.retrieveAlbum(userId, [albumId]);
    if (!album) {
      throw new NotFoundException(`Album with ID ${albumId} not found`);
    }
    const serverAddress = this.configService.get('SERVER_ADDRESS');
    return {
      notes: '',
      musicBrainzId: '',
      lastFmUrl: '',
      smallImageUrl: `${serverAddress}/...`,
      mediumImageUrl: `${serverAddress}/...`,
      largeImageUrl: `${serverAddress}/...`,
    };
  }
}
