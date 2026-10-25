import { IAudioMetadata } from 'src/types/music-metadata';

export type FileItem = {
  path: string;
  lastModified: Date;
  size: number;
};

export type FileUpdateItem = {
  embeddedData: IAudioMetadata;
  trackId: number;
  path: string;
  lastModified: Date;
  size: number;
};

export type LogEntry = {
  date: Date;
  accountId: number;
  message: string;
  rootPathId: number;
};
