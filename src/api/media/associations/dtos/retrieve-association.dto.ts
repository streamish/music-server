/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { LibraryAlbumWithTracksDto, LibraryAssociationDto } from 'src/library/dtos';
import { createItemResponseDto } from 'src/api/response.dto';

export class RetrieveAssociationQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ASSOCIATION_ID_ERROR) {}

export class AssociationWithCreditsDto extends LibraryAssociationDto {
  @ApiProperty({
    type: LibraryAlbumWithTracksDto,
    isArray: true,
  })
  declare albumArtistCredits: LibraryAlbumWithTracksDto[];

  @ApiProperty({
    type: LibraryAlbumWithTracksDto,
    isArray: true,
  })
  declare artistCredits: LibraryAlbumWithTracksDto[];

  @ApiProperty({
    type: LibraryAlbumWithTracksDto,
    isArray: true,
  })
  declare composerCredits: LibraryAlbumWithTracksDto[];

  @ApiProperty({
    type: LibraryAlbumWithTracksDto,
    isArray: true,
  })
  declare genreCredits: LibraryAlbumWithTracksDto[];
}

export class RetrieveAssociationResponseDto extends createItemResponseDto('association', AssociationWithCreditsDto) {}
