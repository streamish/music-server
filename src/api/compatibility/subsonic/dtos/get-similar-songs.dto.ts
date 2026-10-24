import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicSimilarSongsQueryDto {
  @IsString()
  declare id: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare count?: number;
}
