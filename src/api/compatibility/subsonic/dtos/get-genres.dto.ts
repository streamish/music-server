import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicGenresResponseDto extends SubsonicResponseDto {
  declare genres: { genre: { value: string }[] };
}
