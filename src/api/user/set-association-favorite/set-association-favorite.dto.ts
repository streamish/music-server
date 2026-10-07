/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { AssociationTypeEnum } from 'src/types/enums';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsEnum, IsInt, Min } from 'class-validator';

export class UserSetAssociationFavoriteQueryDto {
  /**
   * The ID of the association
   */
  @IsInt({ message: ErrorCodes.INVALID_ASSOCIATION_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ASSOCIATION_ID_ERROR })
  declare id: number;

  @ApiProperty({
    enum: AssociationTypeEnum,
    enumName: 'AssociationTypeEnum',
  })
  @IsEnum(AssociationTypeEnum)
  declare associationType: AssociationTypeEnum;
}

export class UserSetAssociationFavoriteResponseDto extends SuccessResponseDto {}

export class UserSetAssociationFavoriteNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ASSOCIATION_NOT_FOUND_ERROR],
    enumName: 'UserSetAssociationFavoriteNotFoundErrorMessage',
    default: ErrorCodes.ASSOCIATION_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserSetAssociationFavoriteBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR],
    enumName: 'UserSetAssociationFavoriteBadRequestErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}
