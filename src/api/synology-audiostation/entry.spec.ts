import {
  SmartPlaylistConjugalEnum,
  SynologyApiEnum,
  SynologyMethodEnum,
  SynologyPinTypeEnum,
  components,
} from '../../types/api-schema';
import { SynologyApi, createSynologyApi, encryptSynologyCredentials } from '../../test-helper.synology';
import { api } from '../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/entry.cgi', () => {
  let synologyApi: SynologyApi;

  async function createPlaylist(
    name: string,
    type: 'normal' | 'smart',
    conj_rule?: SmartPlaylistConjugalEnum,
    rules_json?: string,
  ) {
    const { data, error } = await synologyApi.createPlaylist(name, type, conj_rule, rules_json);
    const typedData = data as components['schemas']['SynologyPlaylistIdResponseDto'];
    return { data: typedData, error, playlistId: typedData!.data.id };
  }

  async function getPlaylistItems(playlistId: string) {
    const { data, error } = await synologyApi.getPlaylistItems(playlistId);
    const typedData = data as components['schemas']['SynologyPlaylistWithItemsResponseDto'];
    return { data: typedData, error, playlist: typedData!.data.playlists![0]! };
  }

  async function addFavorite(
    items: Array<{ criteria: Record<string, string>; name: string; type: SynologyPinTypeEnum }>,
  ) {
    const { error, data } = await synologyApi.addFavorite(items);
    const typedData = data as components['schemas']['SynologyEntryListPinsResponseDto'];
    return { error, data: typedData, items: typedData?.data.items || [] };
  }

  beforeAll(async () => {
    synologyApi = await createSynologyApi();
  });

  describe('authentication', () => {
    it('should return encryption key and field names', async () => {
      const { data, error } = await api.POST('/webapi/entry.cgi', {
        body: {
          api: SynologyApiEnum.SYNO_API_Encryption,
          method: SynologyMethodEnum.getinfo,
          version: 1,
        },
      });
      expect(error).toBeUndefined();
      const typedData = data as components['schemas']['SynologyEntryCertificateResponseDto'];
      expect(typedData?.data?.public_key.length).toBeGreaterThan(0);
      expect(typedData?.data?.cipherkey.length).toBeGreaterThan(0);
      expect(typedData?.data?.ciphertoken.length).toBeGreaterThan(0);
    });

    it('should sign in successfully', async () => {
      const encryptionKeyResponse = await api.POST(`/webapi/entry.cgi`, {
        body: {
          api: SynologyApiEnum.SYNO_API_Encryption,
          method: SynologyMethodEnum.getinfo,
          version: 1,
        },
      });
      const encryptionKey = encryptionKeyResponse?.data as components['schemas']['SynologyEntryCertificateResponseDto'];
      if (!encryptionKey?.data?.public_key?.length) {
        throw new Error(`Failed to get encryption key`);
      }
      const payload = encryptSynologyCredentials(
        process.env.DEFAULT_ADMIN_USERNAME || 'admin',
        process.env.DEFAULT_ADMIN_PASSWORD || 'admin',
        encryptionKey.data.public_key,
      );
      const { error, data } = await api.POST(`/webapi/entry.cgi`, {
        body: {
          __cIpHeRtExT: payload,
          client_time: encryptionKey.data.server_time,
        },
      });
      expect(error).toBeUndefined();
      const typedData = data as components['schemas']['SynologyEntrySignInResponseDto'];
      expect(typedData?.data?.sid.length).toBeGreaterThan(0);
      expect(typedData?.data?.did.length).toBeGreaterThan(0);
    });

    it('should reject invalid account username', async () => {
      const encryptionKeyResponse = await api.POST(`/webapi/entry.cgi`, {
        body: {
          api: SynologyApiEnum.SYNO_API_Encryption,
          method: SynologyMethodEnum.getinfo,
          version: 1,
        },
      });
      const encryptionKey = encryptionKeyResponse?.data as components['schemas']['SynologyEntryCertificateResponseDto'];
      if (!encryptionKey?.data?.public_key?.length) {
        throw new Error(`Failed to get encryption key`);
      }
      const payload = encryptSynologyCredentials(
        'fred',
        process.env.DEFAULT_ADMIN_PASSWORD || 'admin',
        encryptionKey.data.public_key,
      );
      const { error } = await api.POST(`/webapi/entry.cgi`, {
        body: {
          __cIpHeRtExT: payload,
          client_time: encryptionKey.data.server_time,
        },
      });
      expect(error).toBeDefined();
      expect((error as unknown as { message: string[] }).message[0]).toBe('invalid-username-error');
    });

    it('should reject invalid account password', async () => {
      const encryptionKeyResponse = await api.POST(`/webapi/entry.cgi`, {
        body: {
          api: SynologyApiEnum.SYNO_API_Encryption,
          method: SynologyMethodEnum.getinfo,
          version: 1,
        },
      });
      const encryptionKey = encryptionKeyResponse?.data as components['schemas']['SynologyEntryCertificateResponseDto'];
      if (!encryptionKey?.data?.public_key?.length) {
        throw new Error(`Failed to get encryption key`);
      }
      const payload = encryptSynologyCredentials(
        process.env.DEFAULT_ADMIN_USERNAME || 'admin',
        'pony123',
        encryptionKey.data.public_key,
      );
      const { error } = await api.POST(`/webapi/entry.cgi`, {
        body: {
          __cIpHeRtExT: payload,
          client_time: encryptionKey.data.server_time,
        },
      });
      expect(error).toBeDefined();
      expect((error as unknown as { message: string[] }).message[0]).toBe('invalid-password-error');
    });

    it('should reject invalid public key', async () => {
      const payload = encryptSynologyCredentials(
        process.env.DEFAULT_ADMIN_USERNAME || 'admin',
        process.env.DEFAULT_ADMIN_PASSWORD || 'admin',
        [
          'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAygDdPPqBY3P1IWl7rsoP',
          '/M6MV/yBABTuQaPjJg8Yt8xWtH5xg/hdSXYeqme+DcajL2xg8hY2pqUVAVUWHscT',
          '0000000000000000000000000000000000000000000000000000000+EvzRiivB',
          'VQsuamCxwUvk2va8zhvZrWwqukI3nFG823wdME/0000000000000000000000000',
          '000000000000000000000000000000000000000000000000000000000000000/',
          '8oY9UpM6bmGK4QuWns8ZOOcWLN1RGIs9WaAzISVJZJ4cpC18vbj+000000000000',
          '000000000000000000000000+2FWpPZ47U0lmjZrJHa8N+awKJn7GvA+uxskjo+0',
          '00000000000000000000000000000000000000000000000/kkC0ICVTXaAgl749',
          'n/00000000000000000000000/fsM1PSfBHHEectZMdpaaHbU3Um+00000+oFfnZ',
          '5m7h1vWHI0fu/0000000000000000000+cC4DoUCxE0O0w48Db98pWMkAXgUGIo8',
          '7l3ZX+L9iXvg2vNPug+0OZSfZ7MbtXL51BnK/CXKaSgHYrBJb62V9jms8YZkunDx',
          'TTBzr2U7+Bc6mLeBhA0wE80CAwEAAQ==',
        ].join(''),
      );
      const { error } = await api.POST(`/webapi/entry.cgi`, {
        body: {
          __cIpHeRtExT: payload,
          client_time: Math.floor(new Date().getTime() / 1000),
        },
      });
      expect(error).toBeDefined();
      expect((error as unknown as { message: string[] }).message[0]).toBe('Invalid encrypted payload');
    });

    it('should clearSessionToken', async () => {
      const newApi = await createSynologyApi();
      const { data } = await newApi.clearSessionToken();
      expect(data?.success).toBe(true);
    });
  });

  describe('favorites', () => {
    it('should list favorite items', async () => {});

    it('should favorite "recently added" playlist', async () => {
      const { items } = await addFavorite([
        {
          criteria: {},
          name: 'Recently Added',
          type: SynologyPinTypeEnum.recently_added,
        },
      ]);
      expect(items.length).toBeGreaterThan(0);
      expect(items.some((item) => item.type.toString() === SynologyPinTypeEnum.recently_added)).toBe(true);
    });

    it('should favorite "random 100" playlist', async () => {
      const { items } = await addFavorite([
        {
          criteria: {},
          name: 'Random100',
          type: SynologyPinTypeEnum.random_100,
        },
      ]);
      expect(items.length).toBeGreaterThan(0);
      expect(items.some((item) => item.type.toString() === SynologyPinTypeEnum.random_100)).toBe(true);
    });

    it('should favorite root folder', async () => {
      const { items } = await addFavorite([
        {
          criteria: {
            folder: '1',
          },
          name: 'Root Folder',
          type: SynologyPinTypeEnum.folder,
        },
      ]);
      expect(items.length).toBeGreaterThan(0);
      expect(
        items.some((item) => item.type.toString() === SynologyPinTypeEnum.folder && item.name === 'Artist 1'),
      ).toBe(true);
    });

    it('should favorite nested folder', async () => {
      const { items } = await addFavorite([
        {
          criteria: {
            folder: '5',
          },
          name: 'Nested Folder',
          type: SynologyPinTypeEnum.folder,
        },
      ]);
      expect(items.length).toBeGreaterThan(0);
      expect(items.some((item) => item.type.toString() === SynologyPinTypeEnum.folder && item.name === 'Album 2')).toBe(
        true,
      );
    });

    it('should favorite artist', async () => {
      const { items } = await addFavorite([
        {
          criteria: {
            artist: 'Artist 1',
          },
          name: 'Artist 1',
          type: SynologyPinTypeEnum.artist,
        },
      ]);
      expect(items.length).toBeGreaterThan(0);
      expect(
        items.some((item) => item.type.toString() === SynologyPinTypeEnum.artist && item.name === 'Artist 1'),
      ).toBe(true);
    });

    it('should favorite composer', async () => {
      const { items } = await addFavorite([
        {
          criteria: {
            composer: 'Composer 1',
          },
          name: 'Composer 1',
          type: SynologyPinTypeEnum.composer,
        },
      ]);
      expect(items.length).toBeGreaterThan(0);
      expect(
        items.some((item) => item.type.toString() === SynologyPinTypeEnum.composer && item.name === 'Composer 1'),
      ).toBe(true);
    });

    it('should favorite genre', async () => {
      const { items } = await addFavorite([
        {
          criteria: {
            genre: 'Acid',
          },
          name: 'Acid',
          type: SynologyPinTypeEnum.genre,
        },
      ]);
      expect(items.length).toBeGreaterThan(0);
      expect(items.some((item) => item.type.toString() === SynologyPinTypeEnum.genre && item.name === 'Acid')).toBe(
        true,
      );
    });

    it('should favorite album', async () => {
      const { items } = await addFavorite([
        {
          criteria: {
            album: 'Album 1',
            album_artist: 'Artist 1',
          },
          name: 'Album 1',
          type: SynologyPinTypeEnum.album,
        },
      ]);
      expect(items.length).toBeGreaterThan(0);
      expect(items.some((item) => item.type.toString() === SynologyPinTypeEnum.album && item.name === 'Album 1')).toBe(
        true,
      );
    });

    it('should favorite playlist', async () => {
      const { playlistId } = await createPlaylist('Test Playlist', 'normal');
      const { items } = await addFavorite([
        {
          criteria: {
            playlist: playlistId,
          },
          name: 'Test Playlist',
          type: SynologyPinTypeEnum.playlist,
        },
      ]);
      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThan(0);
      expect(
        items.some((item) => item.type.toString() === SynologyPinTypeEnum.playlist && item.name === 'Test Playlist'),
      ).toBe(true);
    });

    it('should unfavorite items', async () => {
      const { items } = await addFavorite([
        {
          criteria: {
            album: 'Album 1',
          },
          name: 'Album 1',
          type: SynologyPinTypeEnum.album,
        },
      ]);
      const favorite = items.find(
        (item) => item.type.toString() === SynologyPinTypeEnum.album && item.name === 'Album 1',
      );
      expect(favorite).toBeDefined();
      const { data: unpinData } = await synologyApi.deleteFavorite([Number.parseInt(favorite?.id || '0', 10)]);
      expect(unpinData?.success).toBe(true);
    });
  });

  describe('playlists', () => {
    it('should add album to playlist', async () => {
      const playlistName = `Test Playlist ${new Date().getTime()}`;
      const { playlistId } = await createPlaylist(playlistName, 'normal');
      const { data } = await synologyApi.addContainerToPlaylist(playlistId, {
        album: 'Album 1',
        album_artist: 'Artist 1',
      });
      expect(data?.success).toBe(true);
      const { playlist } = await getPlaylistItems(playlistId);
      expect(
        playlist.additional.songs.some(
          (item) =>
            item.additional.song_tag.album === 'Album 1' && item.additional.song_tag.album_artist === 'Artist 1',
        ),
      ).toBe(true);
    });

    it('should add artist to playlist', async () => {
      const playlistName = `Test Playlist ${new Date().getTime()}`;
      const { playlistId } = await createPlaylist(playlistName, 'normal');
      const { data } = await synologyApi.addContainerToPlaylist(playlistId, {
        artist: 'Artist 1',
      });
      expect(data?.success).toBe(true);
      const { playlist } = await getPlaylistItems(playlistId);
      expect(playlist.additional.songs.some((item) => item.additional.song_tag.artist === 'Artist 1')).toBe(true);
    });

    it('should add composer to playlist', async () => {
      const playlistName = `Test Playlist ${new Date().getTime()}`;
      const { playlistId } = await createPlaylist(playlistName, 'normal');
      const { data } = await synologyApi.addContainerToPlaylist(playlistId, {
        composer: 'Composer 4',
      });
      expect(data?.success).toBe(true);
      const { playlist } = await getPlaylistItems(playlistId);
      expect(playlist.additional.songs.some((item) => item.additional.song_tag.composer === 'Composer 4')).toBe(true);
    });

    it('should add genre to playlist', async () => {
      const playlistName = `Test Playlist ${new Date().getTime()}`;
      const { playlistId } = await createPlaylist(playlistName, 'normal');
      const { data } = await synologyApi.addContainerToPlaylist(playlistId, {
        genre: 'Acid',
      });
      expect(data?.success).toBe(true);
      const { playlist } = await getPlaylistItems(playlistId);
      expect(playlist.additional.songs.some((item) => item.additional.song_tag.genre === 'Acid')).toBe(true);
    });
  });
});
