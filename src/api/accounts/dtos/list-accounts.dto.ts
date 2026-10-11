/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';
import { UserRoleEnum } from 'src/types/enums';

export class AccountDto {
  @IsInt()
  declare id: number;

  @IsString()
  declare username: string;

  @ApiProperty({
    enum: UserRoleEnum,
    enumName: 'UserRoleEnum',
    isArray: true,
  })
  declare roles: UserRoleEnum[];
}

export class ListAccountsResponseDto extends SuccessResponseDto {
  @ApiProperty({ type: AccountDto, isArray: true })
  declare accounts: AccountDto[];
}
