/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Min } from 'class-validator';
import { LibraryAlbumWithTracksDto, LibraryAssociationDto } from 'src/library/dtos';

export class UserRetrieveAssociationQueryDto {
  /**
   * The ID of the association
   */
  @IsInt({ message: ErrorCodes.INVALID_ASSOCIATION_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ASSOCIATION_ID_ERROR })
  declare id: number;
}

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

export class UserRetrieveAssociationResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: AssociationWithCreditsDto,
  })
  declare association: AssociationWithCreditsDto;
}

export class UserRetrieveAssociationNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ARTIST_NOT_FOUND_ERROR],
    enumName: 'UserRetrieveAssociationNotFoundErrorMessage',
    default: ErrorCodes.ARTIST_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserRetrieveAssociationBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_ASSOCIATION_ID_ERROR],
    enumName: 'UserRetrieveAssociationBadRequestErrorMessage',
    default: ErrorCodes.INVALID_ASSOCIATION_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
