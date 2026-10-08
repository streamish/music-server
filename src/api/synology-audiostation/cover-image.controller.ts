import { AccountEntity } from 'src/database/entities';
import { BINARY_RESPONSE, IMAGE_MIME_TYPES } from 'src/constants/swagger';
import { CoverCgiAlbumQueryDto, CoverCgiArtistQueryDto, CoverCgiComposerQueryDto, CoverCgiSongQueryDto } from './dtos';
import { Get, HttpStatus, Logger, Query, Req, Res } from '@nestjs/common';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import { SynologyCoverImageService } from './cover-image.service';
import { User } from '../user.decorator';
import { join, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@SynologyController()
export class SynologyCoverImageController {
  private readonly logger: Logger = new Logger(SynologyCoverImageController.name);

  constructor(private readonly coverImageService: SynologyCoverImageService) {}

  @SynologyApiEndpoint(Get, '/AudioStation/cover.cgi', HttpStatus.OK, {
    summary: 'Retrieves the cover image for an album, artist, composer or song',
    description: [
      'Retrieves the cover image for an album, artist, composer or song.',
      'The cover image can be retrieved by specifying the appropriate query parameters in the request.',
      'If an image is not found a default blank cover image will be returned.',
    ].join(' '),
    isAuthenticated: true,
    produces: IMAGE_MIME_TYPES,
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async route(
    @User() user: AccountEntity,
    @Req() request: Request,
    @Res() response: Response,
    @Query()
    query: CoverCgiAlbumQueryDto | CoverCgiArtistQueryDto | CoverCgiComposerQueryDto | CoverCgiSongQueryDto,
  ) {
    let album;
    if ('id' in query) {
      album = await this.coverImageService.getTrackCoverImage(user.id, query.id);
    } else if ('artist_name' in query) {
      album = await this.coverImageService.getArtistCoverImage(user.id, query.artist_name);
    } else if ('album_name' in query) {
      album = await this.coverImageService.getAlbumCoverImage(user.id, query.album_artist_name, query.album_name);
    } else if ('composer_name' in query) {
      album = await this.coverImageService.getComposerCoverImage(user.id, query.composer_name);
    }
    if (album?.coverImage) {
      const eTag = `album-${album.id}-${album.updatedAt?.getTime() || ''}-2`;
      const fileType = album.coverImageMimeType.split(sep).pop();
      response.set({
        'Content-Type': album.coverImageMimeType,
        'Content-Disposition': `inline; filename="album-cover.${album.id}.${fileType}"`,
        ETag: eTag,
      });
      if (request.fresh) {
        response.status(304);
        return response.end(emptyBuffer);
      }
      return response.end(album.coverImage);
    }
    // anticipated for:
    // genres: default_genre_name="..."
    // folders: id="dir_n"
    response.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="album-cover.blank.png"`,
      ETag: 'blank-cover',
    });
    if (request.fresh) {
      response.status(304);
      return response.end(emptyBuffer);
    }
    blankBuffer = blankBuffer || readFileSync(join(__dirname, 'resources', 'blank-cover.png'));
    return response.end(blankBuffer);
  }
}
