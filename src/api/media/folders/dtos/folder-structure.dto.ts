import { LibraryFolderDto } from 'src/library/dtos';
import { createArrayResponseDto } from 'src/api/response.dto';

export class FolderStructureResponseDto extends createArrayResponseDto('items', LibraryFolderDto) {}
