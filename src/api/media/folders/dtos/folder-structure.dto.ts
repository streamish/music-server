import { ApiProperty } from '@nestjs/swagger';
import { LibraryFolderDto } from 'src/library/dtos';
import { SuccessResponseDto } from 'src/api/response.dto';

export class FolderStructureResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: LibraryFolderDto,
    isArray: true,
  })
  declare items: LibraryFolderDto[];
}
