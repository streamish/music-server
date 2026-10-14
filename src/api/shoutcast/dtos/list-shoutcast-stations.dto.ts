import { ShoutcastStationDto } from 'src/shoutcast/dtos/shoutcast-station.dto';
import { createArrayResponseDto } from 'src/api/response.dto';

export class ListShoutcastStationsResponseDto extends createArrayResponseDto('stations', ShoutcastStationDto) {}
