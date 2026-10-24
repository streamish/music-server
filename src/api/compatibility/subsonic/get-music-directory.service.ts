import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { libraryFolderToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicMusicDirectoryService {
  constructor(private readonly libraryService: LibraryService) {}

  async getMusicDirectory(userId: number, folderId: number) {
    const startingPath = await this.libraryService.listFolderContents(userId, folderId);
    return libraryFolderToRow(startingPath);
  }
}
