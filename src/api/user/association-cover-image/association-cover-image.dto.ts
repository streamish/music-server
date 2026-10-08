import { ApiProperty } from '@nestjs/swagger';
import { AssociationTypeEnum } from 'src/types/enums';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UserAssociationCoverImageQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ASSOCIATION_ID_ERROR) {
  /**
   * The width/height size of the image in pixels
   */
  @IsInt({ message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  @Min(100, { message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  @Max(1000, { message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  declare size: number;

  /**
   * The type of association
   */
  @ApiProperty({
    enum: AssociationTypeEnum,
    enumName: 'AssociationTypeEnum',
    required: false,
  })
  @IsEnum(AssociationTypeEnum)
  @IsOptional()
  declare type: AssociationTypeEnum;
}
