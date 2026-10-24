import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicCoverArtQueryDto {
  @IsString()
  declare id: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  declare size?: number;
}
