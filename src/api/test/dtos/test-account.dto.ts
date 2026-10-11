import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { UserRoleEnum } from 'src/types/enums';

export class TestAccountDto {
  @IsInt()
  declare accountId: number;

  @IsString()
  declare username: string;

  @ApiProperty({
    enum: UserRoleEnum,
    enumName: 'UserRoleEnum',
    isArray: true,
  })
  declare roles: UserRoleEnum[];
}
