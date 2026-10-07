import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { LibraryTrackDto } from 'src/library/dtos';

export class LibraryFolderDto {
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

  @IsString()
  @IsOptional()
  declare file?: string;

  @IsString()
  @IsOptional()
  declare folder?: string;

  @IsString()
  declare fullPath: string;

  @IsInt()
  declare id: number;

  @ApiProperty({
    type: LibraryTrackDto,
    required: false,
  })
  declare track?: LibraryTrackDto;
}
