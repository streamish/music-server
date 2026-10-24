import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicRandomSongsQueryDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare size?: number;

  @IsString()
  @IsOptional()
  declare genre?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare fromYear?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare toYear?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare musicFolderId?: number;
}
