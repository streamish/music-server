export type FileItem = {
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

export type IndexedFile = {
  id: number;
  filePath: string;
  fileMtime: Date;
};
