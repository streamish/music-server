import { ContentTypeEnum, TrackSortFieldEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SynologyFolderDataDto, SynologyFolderDto, SynologySongDto } from './dtos';
import { UserTreeItemDto } from '../user/folder-structure/folder-structure.dto';
import { sep } from 'node:path';
import type { LibraryTrackDto } from 'src/library/dtos';

function folderToRow(folder: UserTreeItemDto): SynologyFolderDto {
  return {
    id: `dir_${folder.id}`,
    is_personal: false,
    path: folder.folder || '',
    title: folder.folder?.split(sep).pop() || folder.folder || '',
    type: ContentTypeEnum.FOLDER,
  };
}

function fileToRow(track: LibraryTrackDto): SynologySongDto {
  return {
    additional: {
      song_audio: {
        bitrate: track.fileBitRate,
        channel: track.fileChannels,
        codec: track.fileType,
        container: track.fileType,
        duration: track.duration,
        filesize: track.fileSize,
        frequency: track.fileFrequency,
      },
      song_rating: {
        rating: 0,
      },
      song_tag: {
        album: track.albumTitle,
        album_artist: track.albumArtists.join(', '),
        artist: track.artists.map((artist) => artist.name).join(', '),
        comment: track.comment || '',
        composer: track.composers.map((composer) => composer.name).join(', '),
        disc: track.discNumber,
        genre: track.genres.map((genre) => genre.name).join(', '),
        track: track.trackNumber,
        year: track.year,
      },
    },
    id: `music_${track.id}`,
    path: track.filePath,
    title: track.filePath.split(sep).pop() || track.filePath,
    type: ContentTypeEnum.FILE,
  };
}

@Injectable()
export class SynologyFolderService {
  constructor(private readonly libraryService: LibraryService) {}

  async listRootFolders(accountId: number, offset: number, limit: number): Promise<SynologyFolderDataDto> {
    const folderTree = await this.libraryService.listFolders(accountId);
    return {
      items: folderTree
        .map((folderTreeItem) => folderToRow(folderTreeItem))
        .splice(offset)
        .slice(0, limit),
      folder_total: folderTree.length,
      offset,
      total: folderTree.length,
    };
  }

  async listFolders(
    accountId: number,
    folderId: number,
    offset: number,
    limit: number,
  ): Promise<SynologyFolderDataDto> {
    function findItem(treeItem: UserTreeItemDto) {
      const result = treeItem.id === folderId ? treeItem : null;
      if (result) {
        return result;
      }
      if (treeItem.children) {
        for (let i = 0, len = treeItem.children.length; i < len; i += 1) {
          const child = treeItem.children[i];
          if (child?.folder) {
            const found = findItem(child);
            if (found) {
              return found;
            }
          }
        }
      }
      return null;
    }
    const folderTree = await this.libraryService.listFolders(accountId);
    const startingFolder = folderTree.map(findItem).find((item) => item !== null);
    if (!startingFolder) {
      throw new Error(`Folder with id ${folderId} not found`);
    }
    const folderTotal = startingFolder.children ? startingFolder.children.length : 0;
    const pathContents = startingFolder.children || [];
    const folderItems = pathContents.filter((item) => item?.folder).map(folderToRow);
    const filePaths = pathContents.filter((item) => item?.file).map((file) => file.fullPath);
    const fileItems = await this.libraryService.listTracks(
      accountId,
      {
        filePath: `${startingFolder.fullPath}/`,
      },
      0,
      100_000,
      TrackSortFieldEnum.TITLE,
    );
    const fileItemsMapped = fileItems.items
      .filter((track) => {
        return filePaths.indexOf(track.filePath) > -1;
      })
      .map(fileToRow);
    return {
      folder_total: folderTotal,
      id: `dir_${startingFolder.id}`,
      items: [...folderItems, ...fileItemsMapped].slice(offset, offset + limit),
      offset,
      total: startingFolder.children.length,
    };
  }
}
