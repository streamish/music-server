import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { BINARY_RESPONSE, IMAGE_MIME_TYPES } from 'src/constants/swagger';
import { Get, HttpStatus, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserAssociationCoverImageQueryDto } from './association-cover-image.dto';
import { UserAssociationCoverImageService } from './association-cover-image.service';
import { join, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@UserController()
export class UserAssociationCoverImageController {
  constructor(private readonly coverImageService: UserAssociationCoverImageService) {}

  @ApiEndpoint(Get, 'association-cover-image', HttpStatus.OK, {
    summary: 'Retrieves cover images for associated artists, composers and genres',
    description: [
      'This endpoint retrieves the cover image for a specified artist, composer or genre, or an album if unspecified.',
      'The image comes from the first track that contains a cover and credits them as an album artist.',
      'If no album cover is found, it falls back to the first track crediting them as a track artist.',
      'If the artist has no cover image a default blank cover is returned.',
      'The response supports Etag caching to optimize browser performance.',
    ].join(' '),
    isAuthenticated: true,
    produces: [...IMAGE_MIME_TYPES],
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserAssociationCoverImageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const coverImage = await this.coverImageService.getImage(user.id, query.id, query.size, query.type);
    if (coverImage?.coverImage && coverImage.coverImageMimeType) {
      const eTag = `artist-${query.id}-cover-${query.size}-${query.type}-${coverImage.updatedAt?.getTime() || ''}`;
      const fileType = coverImage.coverImageMimeType.split(sep).pop();
      response.set({
        'Content-Disposition': `inline; filename="artist-cover.${query.id}.${fileType}"`,
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
      'Content-Disposition': `inline; filename="artist-cover.${query.id}.png"`,
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
