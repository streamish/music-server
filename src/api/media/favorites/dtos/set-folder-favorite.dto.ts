import { IsString } from 'class-validator';

export class SetFolderFavoriteQueryDto {
  @IsString()
  declare folder: string;
}
