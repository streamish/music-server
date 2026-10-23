import { IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubsonicGetArtistQueryDto {
  @IsInt()
  @Transform(({ obj }) => Number.parseInt(obj.f?.substring('artist-'.length), 10) ?? undefined)
  declare id: number;
}
