import { ApiProperty } from '@nestjs/swagger';
import { AssociationTypeEnum } from 'src/types/enums';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsEnum } from 'class-validator';

export class SetAssociationFavoriteQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ASSOCIATION_ID_ERROR) {
  @ApiProperty({
    enum: AssociationTypeEnum,
    enumName: 'AssociationTypeEnum',
  })
  @IsEnum(AssociationTypeEnum, { message: ErrorCodes.INVALID_ASSOCIATION_TYPE_ERROR })
  declare associationType: AssociationTypeEnum;
}
