/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicGenreDto {
  @ApiProperty({ type: String })
  declare value: string;
}

export class SubsonicGenresDataDto {
  @ApiProperty({ type: SubsonicGenreDto, isArray: true })
  declare genre: SubsonicGenreDto[];
}
export class SubsonicGenresResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicGenresDataDto })
  declare genres: SubsonicGenresDataDto;
}
