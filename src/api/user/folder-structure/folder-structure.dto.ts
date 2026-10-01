/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { LibraryTrackDto } from 'src/library/dtos';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserTreeItemDto {
  @ApiProperty({
    type: UserTreeItemDto,
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
  declare children?: UserTreeItemDto[];

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

export class UserFolderStructureResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: UserTreeItemDto,
    isArray: true,
  })
  declare items: UserTreeItemDto[];
}
