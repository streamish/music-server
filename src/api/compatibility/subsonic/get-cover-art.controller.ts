import { AccountEntity } from 'src/database/entities';
import { AssociationTypeEnum } from 'src/types/enums';
import { BINARY_RESPONSE } from 'src/constants/swagger';
import { CoverImagesService } from 'src/cover-images/cover-images.service';
import { Get, HttpStatus, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { SubsonicCoverArtQueryDto } from './dtos';
import { SubsonicErrorCode, SubsonicException } from './subsonic-error';
import { User } from 'src/api/user.decorator';
import type { Request, Response } from 'express';

import { SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';

const DEFAULT_SIZE = 600;

@SubsonicController()
export class SubsonicCoverArtController {
  constructor(private readonly coverImagesService: CoverImagesService) {}

  /**
   * Ids are album ids, or `ar-<id>` for artists.
   */
  @SubsonicApiEndpoint(Get, 'getCoverArt', HttpStatus.OK, {
    summary: 'Get Cover Art',
    description: 'Retrieve cover art for an album or artist.',
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async getCoverArt(
    @User() user: AccountEntity,
    @Query() query: SubsonicCoverArtQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isArtist = query.id.startsWith('ar-');
    const id = Number(isArtist ? query.id.slice(3) : query.id);
    if (!Number.isInteger(id) || id < 1) {
      throw new SubsonicException(SubsonicErrorCode.DATA_NOT_FOUND, 'The requested data was not found');
    }
    const size = query.size || DEFAULT_SIZE;
    const coverImage = isArtist
      ? await this.coverImagesService.getAssociationCover(user.id, id, size, AssociationTypeEnum.ARTIST)
      : await this.coverImagesService.getAlbumCover(user.id, id, size);
    const updatedAt = 'updatedAt' in coverImage ? (coverImage.updatedAt as Date | undefined)?.getTime() : '';
    res.set({
      'Content-Type': coverImage.coverImageMimeType,
      ETag: `${query.id}-cover-${size}-${updatedAt || ''}`,
    });
    if (request.fresh) {
      res.status(304);
      return new StreamableFile(Buffer.alloc(0));
    }
    return new StreamableFile(coverImage.coverImage);
  }
}
