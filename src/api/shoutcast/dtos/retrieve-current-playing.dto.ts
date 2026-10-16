import { createItemResponseDto } from 'src/api/response.dto';

export class RetrieveCurrentPlayingResponseDto extends createItemResponseDto('title', String) {}
