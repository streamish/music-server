import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicAlbumInfoQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}
