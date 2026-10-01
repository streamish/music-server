import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { BINARY_RESPONSE, COOKIE_TOKEN_HEADER, IMAGE_MIME_TYPES, USER_APIS } from 'src/constants/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { UserAlbumCoverImageQueryDto } from './album-cover-image.dto';
import { UserAlbumCoverImageService } from './album-cover-image.service';
import { UserRoleEnum } from 'src/types/enums';
import { join, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserAlbumCoverImageController {
  constructor(private readonly coverImageService: UserAlbumCoverImageService) {}

  @Get('album-cover-image')
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiOperation({
    summary: 'Retrieves cover images for albums',
    description: [
      'This endpoint retrieves the cover image for a specified album.',
      'The image comes from the first track that contains a cover or a default blank cover.',
      'The response supports Etag caching to optimize browser performance.',
    ].join('\n'),
  })
  @ApiHeader(COOKIE_TOKEN_HEADER)
  @ApiProduces(...IMAGE_MIME_TYPES)
  @ApiOkResponse(BINARY_RESPONSE)
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
