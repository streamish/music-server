import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SubsonicStarredQueryDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare musicFolderId?: number;
}
