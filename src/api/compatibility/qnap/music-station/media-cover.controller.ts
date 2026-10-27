import { AccountEntity } from 'src/database/entities';
import { BINARY_RESPONSE, IMAGE_MIME_TYPES } from 'src/constants/swagger';
import { CoverImage } from 'src/cover-images/types/cover-image';
import { Get, HttpStatus, NotFoundException, Query, Req, Res } from '@nestjs/common';
import { QnapApiEndpoint, QnapController } from './qnap.decorator';
import { QnapMediaCoverQueryDto } from './dtos/media-cover.dto';
import { QnapMediaCoverService } from './media-cover.service';
import { User } from '../../../user.decorator';
import type { Request, Response } from 'express';

const emptyBuffer = Buffer.alloc(0);

@QnapController({ path: '/musicstation/api' })
export class QnapMediaCoverController {
  constructor(private readonly mediaCoverApiService: QnapMediaCoverService) {}

  @QnapApiEndpoint(Get, 'mediacover_api.php', HttpStatus.OK, {
    summary: 'Retrieves cover images',
    description: [
      'This endpoint retrieves the cover image for a specified album, artist, or folder.',
      'The image comes from the first song in the album that contains an embedded image.',
      'If the album has no cover image a default blank cover is returned.',
      'The response supports Etag caching to optimize browser performance.',
      'The asset ID may be provided as an `imagepath` value like `api/mediacover_api.php?id=123` or as an ID value.',
    ].join(' '),
    isAuthenticated: true,
    produces: IMAGE_MIME_TYPES,
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async get(
    @User() user: AccountEntity,
    @Req() request: Request,
    @Res() response: Response,
    @Query() query: QnapMediaCoverQueryDto,
  ) {
    if (query.imagepath) {
      const parts = query.imagepath.split('?').pop();
      if (parts?.length) {
        const [key, val] = parts.split('=');
        if (val) {
          const q = query;
          if (key === 'artistId') {
            q.artistId = Number.parseInt(val, 10);
          } else if (key === 'albumId') {
            q.albumId = Number.parseInt(val, 10);
          } else if (key === 'folderId') {
            q.folderId = Number.parseInt(val, 10);
          }
        }
      }
    }
    let cover: CoverImage;
    if (query.albumId) {
      cover = await this.mediaCoverApiService.getAlbumCoverImage(user.id, query.albumId);
    } else if (query.artistId) {
      cover = await this.mediaCoverApiService.getArtistCoverImage(user.id, query.artistId);
    } else if (query.folderId) {
      cover = await this.mediaCoverApiService.getFolderCoverImage();
    } else {
      throw new NotFoundException('Resource not found');
    }
    if (!cover) {
      throw new NotFoundException('Resource not found');
    }
    response.set({
      'Content-Type': cover.coverImageMimeType,
      'Content-Disposition': `inline; filename="${cover.fileName}"`,
      ETag: cover.eTag,
    });
    if (request.fresh) {
      response.status(304);
      return response.end(emptyBuffer);
    }
    return response.end(cover.coverImage);
  }
}
