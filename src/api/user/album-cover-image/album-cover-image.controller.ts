import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { BINARY_RESPONSE, IMAGE_MIME_TYPES } from 'src/constants/swagger';
import { Get, HttpStatus, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { UserAlbumCoverImageQueryDto } from './album-cover-image.dto';
import { UserAlbumCoverImageService } from './album-cover-image.service';
import { join, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@UserController()
export class UserAlbumCoverImageController {
  constructor(private readonly coverImageService: UserAlbumCoverImageService) {}

  @ApiEndpoint(Get, 'album-cover-image', HttpStatus.OK, {
    summary: 'Retrieves cover images for albums',
    description: [
      'This endpoint retrieves the cover image for a specified album.',
      'The image comes from the first track that contains a cover or a default blank cover.',
      'The response supports Etag caching to optimize browser performance.',
    ].join(' '),
    isAuthenticated: true,
    produces: [...IMAGE_MIME_TYPES],
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async get(
    @Query() query: UserAlbumCoverImageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const coverImage = await this.coverImageService.getImage(query.id, query.size);
    if (coverImage?.coverImage && coverImage.coverImageMimeType) {
      const eTag = `album-${query.id}-cover-${query.size}-${coverImage.updatedAt?.getTime() || ''}`;
      const fileType = coverImage.coverImageMimeType.split(sep).pop();
      response.set({
        'Content-Disposition': `inline; filename="album-cover.${query.id}.${fileType}"`,
        'Content-Type': coverImage.coverImageMimeType,
        ETag: eTag,
      });
      if (request.fresh) {
        response.status(304);
        return new StreamableFile(emptyBuffer);
      }
      return new StreamableFile(coverImage.coverImage);
    }
    response.set({
      'Content-Disposition': `inline; filename="album-cover.${query.id}.png"`,
      'Content-Type': 'image/png',
      ETag: 'blank-cover',
    });
    if (request.fresh) {
      response.status(304);
      return new StreamableFile(emptyBuffer);
    }
    const blankCoverPath = join(__dirname, 'resources', 'blank-cover.png');
    blankBuffer = blankBuffer || readFileSync(blankCoverPath);
    return new StreamableFile(blankBuffer);
  }
}
