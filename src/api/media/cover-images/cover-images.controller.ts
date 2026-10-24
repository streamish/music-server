import { AccountEntity } from 'src/database/entities';
import { AlbumCoverImageQueryDto, AssociationCoverImageQueryDto } from './dtos';
import { ApiCoverImageService } from './cover-images.service';
import { ApiEndpoint } from 'src/api/api.decorator';
import { BINARY_RESPONSE, IMAGE_MIME_TYPES } from 'src/constants/swagger';
import { Controller, Get, HttpStatus, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { CoverImage } from 'src/cover-images/types/cover-image';
import { User } from 'src/api/user.decorator';
import type { Request, Response } from 'express';

const emptyBuffer = Buffer.alloc(0);

@Controller('/api')
export class ApiCoverImageController {
  constructor(private readonly coverImageService: ApiCoverImageService) {}

  /**
   * Serves the provided `CoverImage` or the `resources/blank-cover.png` file if there is no
   * image.  The response will respect `ETag` caching which is keyed on the last modification
   * date of the album.
   * @param request
   * @param response
   * @param coverImage
   */
  private static serveImage(request: Request, response: Response, coverImage: CoverImage) {
    response.set({
      'Content-Disposition': `inline; filename="${coverImage.fileName}"`,
      'Content-Type': coverImage.coverImageMimeType,
      ETag: coverImage.eTag,
    });
    if (request.fresh) {
      response.status(304);
      return new StreamableFile(emptyBuffer);
    }
    return new StreamableFile(coverImage.coverImage);
  }

  /**
   * `GET` request to `/api/album-cover-image`
   */
  @ApiEndpoint(Get, 'album-cover-image', HttpStatus.OK, {
    summary: 'Retrieves cover images for albums',
    description: [
      'This endpoint retrieves the cover image for a specified album.',
      'The image comes from the first track that contains a cover or a default blank cover.',
      'The response supports Etag caching to optimize browser performance.',
    ].join(' '),
    allowUser: true,
    allowAdministrator: true,
    produces: [...IMAGE_MIME_TYPES],
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async getAlbumCover(
    @Query() query: AlbumCoverImageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const coverImage = await this.coverImageService.getAlbumCover(query.id, query.size);
    return ApiCoverImageController.serveImage(request, response, coverImage);
  }

  /**
   * `GET` request to `/api/association-cover-image`
   */
  @ApiEndpoint(Get, 'association-cover-image', HttpStatus.OK, {
    summary: 'Retrieves cover images for associated artists, composers and genres',
    description: [
      'This endpoint retrieves the cover image for a specified artist, composer or genre, or an album if unspecified.',
      'The image comes from the first track that contains a cover and credits them as an album artist.',
      'If no album cover is found, it falls back to the first track crediting them as a track artist.',
      'If the artist has no cover image a default blank cover is returned.',
      'The response supports Etag caching to optimize browser performance.',
    ].join(' '),
    allowUser: true,
    allowAdministrator: true,
    produces: [...IMAGE_MIME_TYPES],
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async getAssociationCover(
    @User() user: AccountEntity,
    @Query() query: AssociationCoverImageQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const coverImage = await this.coverImageService.getAssociationCover(user.id, query.id, query.size, query.type);
    return ApiCoverImageController.serveImage(request, response, coverImage);
  }
}
