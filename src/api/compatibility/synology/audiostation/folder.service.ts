import { ContentTypeEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SynologyFolderDataDto, SynologyFolderDto, SynologySongDto } from './dtos';
import { sep } from 'node:path';
import type { LibraryFolderDto, LibraryTrackDto } from 'src/library/dtos';

function folderToRow(folder: LibraryFolderDto): SynologyFolderDto {
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

  async listFolders(
    accountId: number,
    folderId: number,
    offset: number,
    limit: number,
  ): Promise<SynologyFolderDataDto> {
    const startingFolder = await this.libraryService.listFolderContents(accountId, folderId);
    if (!startingFolder) {
      throw new Error(`Folder with id ${folderId} not found`);
    }
    const pathContents = startingFolder.children || [];
    const folderTotal = pathContents.length;
    const folderItems = pathContents.filter((item) => item.folder).map(folderToRow);
    const fileTracks = pathContents
      .filter((item) => item.track !== undefined)
      .map((item) => item.track) as LibraryTrackDto[];
    const fileItemsMapped = fileTracks.map((track) => fileToRow(track));
    return {
      folder_total: folderTotal,
      id: `dir_${startingFolder.id}`,
      items: [...folderItems, ...fileItemsMapped].slice(offset, offset + limit),
      offset,
      total: folderTotal,
    };
  }
}
