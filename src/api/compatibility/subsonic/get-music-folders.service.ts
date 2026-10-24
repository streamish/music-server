import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { libraryFolderToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicMusicFoldersService {
  constructor(private readonly libraryService: LibraryService) {}

  async getMusicFolders(userId: number) {
    const startingPath = await this.libraryService.listFolderContentsByPath(userId, '/');
    return startingPath.children?.map(libraryFolderToRow) || [];
  }
}
