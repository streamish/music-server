import { Injectable } from '@nestjs/common';
// import { LibraryService } from 'src/library/library.service';

@Injectable()
export class SubsonicMusicFoldersService {
  // constructor(private readonly libraryService: LibraryService) {}

  // eslint-disable-next-line class-methods-use-this
  async getMusicFolders() {
    // const startingPath = await this.libraryService.listFolderContentsByPath(userId, '/');
    // return startingPath.children?.map(libraryFolderToRow) || [];
    return [
      {
        id: 0,
        name: 'Music',
      },
    ];
  }
}
