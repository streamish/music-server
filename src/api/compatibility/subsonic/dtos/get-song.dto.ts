import { IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubsonicSongQueryDto {
  @IsInt()
  @Transform(({ obj }) => Number.parseInt(String(obj.id).substring('song-'.length), 10))
  declare id: number;
}
