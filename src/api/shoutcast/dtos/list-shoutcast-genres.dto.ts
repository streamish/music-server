import { ShoutcastGenreDto } from 'src/shoutcast/dtos/shoutcast-genre.dto';
import { createArrayResponseDto } from 'src/api/response.dto';

export class ListShoutcastGenresResponseDto extends createArrayResponseDto('genres', ShoutcastGenreDto) {}
