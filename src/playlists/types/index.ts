import {
  PlaylistTypeEnum,
  SmartPlaylistConjugalEnum,
  SmartPlaylistFieldEnum,
  SmartPlaylistIntervalTagEnum,
  SmartPlaylistOperationEnum,
} from 'src/types/enums';

export type Playlist = {
  id: number;
  name: string;
  rulesConjugal?: SmartPlaylistConjugalEnum | null;
  type: PlaylistTypeEnum;
  createdAt: Date;
  updatedAt?: Date | null;
  rules?: SmartPlaylistRule[];
};

export type SmartPlaylistRule = {
  id: number;
  field: SmartPlaylistFieldEnum;
  interval?: SmartPlaylistIntervalTagEnum | null;
  operation: SmartPlaylistOperationEnum;
  value: string;
};

export type PlaylistItem = {
  radioStationTitle?: string | null;
  radioStationUrl?: string | null;
  trackId?: number | null;
};
