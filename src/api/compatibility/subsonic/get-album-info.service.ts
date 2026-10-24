import { ConfigService } from 'src/config/config.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SubsonicErrorCode, SubsonicException } from './subsonic-error';

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
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }
    if (!albumId) {
      try {
        const track = await this.libraryService.retrieveTrack(userId, [albumOrTrackId]);
        albumId = track[0]?.albumId;
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }
    if (!albumId) {
      throw new SubsonicException(SubsonicErrorCode.DATA_NOT_FOUND, 'The requested data was not found');
    }
    return this.getAlbumInfo2(userId, albumId);
  }

  async getAlbumInfo2(userId: number, albumId: number) {
    const album = await this.libraryService.retrieveAlbum(userId, [albumId]);
    if (!album?.[0]) {
      throw new SubsonicException(SubsonicErrorCode.DATA_NOT_FOUND, 'The requested data was not found');
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
