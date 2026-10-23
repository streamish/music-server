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
export class SubsonicGetMusicFoldersService {
  constructor(private readonly libraryService: LibraryService) {}

  async getMusicFolders(accountId: number) {
    const startingPath = await this.libraryService.listFolderContentsByPath(accountId, '/');
    return folderToRow(startingPath);
  }
}
