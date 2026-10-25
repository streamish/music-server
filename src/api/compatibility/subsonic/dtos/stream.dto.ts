/* eslint-disable max-classes-per-file */
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicStreamQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}

export class SubsonicStreamResponseDto {
  declare data: Buffer;
}
