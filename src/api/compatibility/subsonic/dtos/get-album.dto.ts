import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicAlbumQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}
