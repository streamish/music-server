import {
  LibraryAlbumDto,
  LibraryAlbumWithTracksDto,
  LibraryAssociationDto,
  LibraryAssociationWithTracksDto,
  LibraryFolderDto,
  LibraryTrackDto,
} from 'src/library/dtos';

export function libraryTrackToRow(track: LibraryTrackDto) {
  return {
    id: `${track.id}`,
    parent: `${track.albumId}`,
    title: track.title,
    album: track.albumTitle,
    albumId: `${track.albumId}`,
    artist: track.artists.map((artist) => artist.name).join(', '),
    artistId: `artist-${track.artists[0]?.id}`,
    track: track.trackNumber,
    year: track.year,
    genre: track.genres.map((genre) => genre.name).join(', '),
    size: track.fileSize,
    contentType: `audio/${track.fileType}`,
    transcodedContentType: `audio/${track.fileType}`,
    transcodedSuffix: track.fileType,
    playCount: 0,
    created: new Date().toISOString().slice(0, 19),
    suffix: track.fileType,
    bitRate: track.fileBitRate,
    duration: track.duration,
    isDir: false,
    type: 'music',
    path: track.filePath,
    discNumber: track.discNumber,
  };
}

export function libraryAlbumToRow(album: LibraryAlbumDto | LibraryAlbumWithTracksDto) {
  return {
    id: `${album.id}`,
    name: album.title,
    artist: album.artists.map((artist) => artist.name).join(', '),
    artistId: `${album.artists?.[0]?.id ?? ''}`,
    year: album.year,
    genre: album.genres.map((genre) => genre.name).join(', '),
    playCount: 0,
    duration: 'tracks' in album ? album.tracks.reduce((sum, track) => sum + track.duration, 0) : 0,
    songCount: 'tracks' in album ? album.tracks.length : 0,
    song: 'tracks' in album ? album.tracks.map(libraryTrackToRow) : undefined,
  };
}

export function libraryAssociationToRow(association: LibraryAssociationDto | LibraryAssociationWithTracksDto) {
  let albums: LibraryAlbumWithTracksDto[] | undefined;
  if ('albums' in association) {
    albums = association.albums;
  }
  return {
    id: `${association.id}`,
    name: association.name,
    album: albums?.map((album) => ({ id: `${album.id}`, name: album.title })),
  };
}

export function libraryFolderToRow(startingPath: LibraryFolderDto) {
  return {
    id: startingPath.id,
    name: startingPath.folder,
  };
}
