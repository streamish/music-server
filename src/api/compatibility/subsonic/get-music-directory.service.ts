import { Injectable } from '@nestjs/common';
import { LibraryFolderDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';

function folderToRow(startingPath: LibraryFolderDto) {
  return {
    id: startingPath.id,
    name: startingPath.folder,
  };
}

@Injectable()
export class SubsonicGetMusicDirectoryService {
  constructor(private readonly libraryService: LibraryService) {}

  async getMusicDirectory(accountId: number, folderId: number) {
    const startingPath = await this.libraryService.listFolderContents(accountId, folderId);
    return folderToRow(startingPath);
  }
}
