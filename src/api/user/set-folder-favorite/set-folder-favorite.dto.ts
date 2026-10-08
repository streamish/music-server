/* eslint-disable max-classes-per-file */
import { IsString } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserSetFolderFavoriteQueryDto {
  @IsString()
  declare folder: string;
}

export class UserSetFolderFavoriteResponseDto extends SuccessResponseDto {}
