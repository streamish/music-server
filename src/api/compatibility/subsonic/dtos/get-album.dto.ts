import { IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubsonicGetAlbumQueryDto {
  @IsInt()
  @Transform(({ obj }) => Number.parseInt(obj.f?.substring('album-'.length), 10) ?? undefined)
  declare id: number;
}
