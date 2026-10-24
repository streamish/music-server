import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicTopSongsQueryDto {
  @IsString()
  declare artist: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare count?: number;
}
