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
    album: track.albumTitle,
    albumId: `${track.albumId}`,
    artist: track.artists.map((artist) => artist.name).join(', '),
    artistId: track.artists[0]?.id || 0,
    bitRate: track.fileBitRate,
    contentType: `audio/${track.fileType}`,
    created: new Date().toISOString(),
    discNumber: track.discNumber,
    duration: Math.ceil(track.duration),
    genre: track.genres.map((genre) => genre.name).join(', '),
    id: track.id,
    isDir: false,
    parent: track.albumId,
    path: `root-${track.rootPathId}${track.filePath}`,
    playCount: 0,
    size: track.fileSize,
    suffix: track.fileType,
    title: track.title,
    track: track.trackNumber,
    // transcodedContentType: `audio/${track.fileType}`,
    // transcodedSuffix: track.fileType,
    type: 'music',
    year: track.year,
  };
}

export function libraryAlbumToRow(album: LibraryAlbumDto | LibraryAlbumWithTracksDto) {
  return {
    artist: album.artists.map((artist) => artist.name).join(', '),
    artistId: album.artists?.[0]?.id ?? 0,
    coverArt: album.id,
    duration: 'tracks' in album ? Math.ceil(album.tracks.reduce((sum, track) => sum + track.duration, 0)) : 0,
    genre: album.genres.map((genre) => genre.name).join(', '),
    id: album.id,
    name: album.title,
    playCount: 0,
    song: 'tracks' in album ? album.tracks.map(libraryTrackToRow) : undefined,
    songCount: 'tracks' in album ? album.tracks.length : 0,
    year: album.year,
  };
}

export function libraryAssociationToRow(association: LibraryAssociationDto | LibraryAssociationWithTracksDto) {
  let albums: LibraryAlbumWithTracksDto[] | undefined;
  if ('albums' in association) {
    albums = association.albums;
  }
  return {
    album: albums?.map((album) => ({ id: `${album.id}`, name: album.title })),
    id: association.id,
    name: association.name,
  };
}

export function libraryFolderToRow(startingPath: LibraryFolderDto) {
  return {
    id: startingPath.id,
    name: startingPath.folder,
  };
}
