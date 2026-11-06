import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { LibraryTrackDto } from './library.track.dto';

export class LibraryFolderDto {
  /**
   * If this item is a folder this property contains its child folders or files.
   */
  @ApiProperty({
    type: LibraryFolderDto,
    isArray: true,
    required: false,
    example: [
      {
        folder: 'sub-folder',
        fullPath: '/path/to/sub-folder',
        id: 123,
      },
    ],
  })
  declare children?: LibraryFolderDto[];

  /**
   * The favorite data for the folder if it exists.
   */
  @IsInt()
  declare favoriteId?: number;

  /**
   * The file name if this item is a file.
   */
  @IsString()
  @IsOptional()
  declare file?: string;

  /**
   * The folder name if this item is a folder.
   */
  @IsString()
  @IsOptional()
  declare folder?: string;

  /**
   * The full path of the folder or file.
   */
  @IsString()
  declare fullPath: string;

  /**
   * The unique ID of the folder or file.
   */
  @IsInt()
  declare id: number;

  /**
   * The relative path of the folder or file.
   */
  @IsString()
  declare relativePath: string;

  /**
   * If the item is a file referring to a track, the track data will be contained here.
   */
  @ApiProperty({
    type: LibraryTrackDto,
    required: false,
  })
  declare track?: LibraryTrackDto;
}
