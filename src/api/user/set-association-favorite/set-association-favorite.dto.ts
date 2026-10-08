/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { AssociationTypeEnum } from 'src/types/enums';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsEnum } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserSetAssociationFavoriteQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ASSOCIATION_ID_ERROR) {
  @ApiProperty({
    enum: AssociationTypeEnum,
    enumName: 'AssociationTypeEnum',
  })
  @IsEnum(AssociationTypeEnum, { message: ErrorCodes.INVALID_ASSOCIATION_TYPE_ERROR })
  declare associationType: AssociationTypeEnum;
}

export class UserSetAssociationFavoriteResponseDto extends SuccessResponseDto {}
