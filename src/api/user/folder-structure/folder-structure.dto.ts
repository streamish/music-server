/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { LibraryFolderDto } from 'src/library/dtos';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserFolderStructureResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: LibraryFolderDto,
    isArray: true,
  })
  declare items: LibraryFolderDto[];
}
