/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IsString, Length } from 'class-validator';
import { LibraryFolderDto } from 'src/library/dtos';
import { createItemResponseDto } from 'src/api/response.dto';

export class ListFolderContentsQueryDto {
  /**
   * The current path within the folder tree to retrieve, defaults to the root '/'
   */
  @IsString({ message: ErrorCodes.INVALID_FOLDER_PATH_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_FOLDER_PATH_LENGTH_ERROR })
  declare path: string;
}

export class ListFolderContentsResponseDto extends createItemResponseDto('folder', LibraryFolderDto) {}
