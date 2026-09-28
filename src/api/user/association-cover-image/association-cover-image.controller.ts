import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { BINARY_RESPONSE, COOKIE_TOKEN_HEADER, IMAGE_MIME_TYPES, USER_APIS } from 'src/constants/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserAssociationCoverImageQueryDto } from './association-cover-image.dto';
import { UserAssociationCoverImageService } from './association-cover-image.service';
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
export class UserAssociationCoverImageController {
  constructor(private readonly coverImageService: UserAssociationCoverImageService) {}

  @Get('association-cover-image')
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiOperation({
    summary: 'Retrieves cover images for associated artists, composers and genres',
    description: [
      'This endpoint retrieves the cover image for a specified artist, composer or genre, or an album if unspecified.',
      // eslint-disable-next-line max-len
      'The image comes from the first track that contains a cover and credits them as an album artist, falling back to the first track crediting them as a track artist.',
      'If the artist has no cover image a default blank cover is returned.',
      'The response supports Etag caching to optimize browser performance.',
    ].join('\n'),
  })
  @ApiHeader(COOKIE_TOKEN_HEADER)
  @ApiProduces(...IMAGE_MIME_TYPES)
  @ApiOkResponse(BINARY_RESPONSE)
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
