/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { UserRoleEnum } from 'src/types/enums';
import { createArrayResponseDto } from 'src/api/response.dto';

export class AccountDto {
  /**
   * The unique identifier for the account.
   */
  @IsInt()
  declare id: number;

  /**
   * The username of the account.
   */
  @IsString()
  declare username: string;

  /**
   * The roles assigned to the account.
   */
  @ApiProperty({
    enum: UserRoleEnum,
    enumName: 'UserRoleEnum',
    isArray: true,
  })
  declare roles: UserRoleEnum[];
}

export class ListAccountsResponseDto extends createArrayResponseDto('accounts', AccountDto) {}
