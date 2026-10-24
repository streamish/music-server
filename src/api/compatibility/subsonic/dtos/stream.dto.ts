import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicStreamQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}
