import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicArtistQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}
