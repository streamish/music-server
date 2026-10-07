import {
  SmartPlaylistConjugalEnum,
  SynologyApiEnum,
  SynologyLibraryEnum,
  SynologyMethodEnum,
  components,
} from '../../types/api-schema';
import { type SynologyApiClient, createSynologyApi } from '../../test-helper';
import { USER_PASSWORD, USER_USERNAME, createTestApi } from '../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/playlist.cgi', () => {
  let api: Awaited<SynologyApiClient>;
  let accountId: number;
  let trackId1: number;
  let trackId2: number;
  let trackId3: number;
  let trackId4: number;
  let trackId5: number;

  beforeAll(async () => {
    const username = `favorites-user-${Date.now()}`;
    const testApi = await createTestApi();
    const account = await testApi.duplicateAccount(USER_USERNAME, username);
    accountId = account.data?.accountId || 0;
    if (!accountId) {
      throw new Error(`Failed to create test account`);
    }
    api = await createSynologyApi(username, USER_PASSWORD);
    const { data } = await api.POST('/webapi/AudioStation/song.cgi', {
      body: {
        additional: 'avg_rating',
        api: SynologyApiEnum.SYNO_AudioStation_Song,
        method: SynologyMethodEnum.list,
        version: 1,
        library: SynologyLibraryEnum.all,
        offset: 0,
        limit: 100_000,
      },
    });
    const typedData = data as components['schemas']['SynologySongResponseDto'];
    trackId1 = Number(typedData.data?.songs[0]?.id.replace('music_', '') || 0);
    trackId2 = Number(typedData.data?.songs[1]?.id.replace('music_', '') || 0);
    trackId3 = Number(typedData.data?.songs[2]?.id.replace('music_', '') || 0);
    trackId4 = Number(typedData.data?.songs[3]?.id.replace('music_', '') || 0);
    trackId5 = Number(typedData.data?.songs[4]?.id.replace('music_', '') || 0);
    if (!trackId1 || !trackId2 || !trackId3 || !trackId4 || !trackId5) {
      throw new Error(`Failed to retrieve test track IDs`);
    }
  }, 120_000);

  afterAll(async () => {
    const testApi = await createTestApi();
    await testApi.deleteAccount(accountId);
  });

  async function addItemToPlaylist(playlistId: string, items: (number | string)[]) {
    return api.POST('/webapi/AudioStation/playlist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Playlist,
        method: SynologyMethodEnum.updatesongs,
        version: 1,
        library: SynologyLibraryEnum.all,
        id: playlistId,
        songs: items.map((id) => (typeof id === 'number' && id > 0 ? `music_${id}` : id)).join(','),
        offset: -1,
      },
    });
  }

  async function createPlaylist(
    name: string,
    type: 'normal' | 'smart',
    conj_rule?: SmartPlaylistConjugalEnum,
    rules_json?: string,
  ) {
    const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Playlist,
        method: type === 'normal' ? SynologyMethodEnum.create : SynologyMethodEnum.createsmart,
        version: 1,
        library: SynologyLibraryEnum.all,
        name,
        ...(type === 'smart' ? { conj_rule, rules_json } : {}),
      },
    });
    const typedData = data as components['schemas']['SynologyPlaylistIdResponseDto'];
    return { data: typedData, error, playlistId: typedData!.data.id };
  }

  async function deletePlaylist(playlistId: string) {
    return api.POST('/webapi/AudioStation/playlist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Playlist,
        method: SynologyMethodEnum.delete,
        version: 1,
        library: SynologyLibraryEnum.all,
        id: playlistId,
      },
    });
  }

  async function getPlaylistItems(playlistId: string) {
    const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Playlist,
        method: SynologyMethodEnum.getsonginfo,
        version: 1,
        library: SynologyLibraryEnum.all,
        id: playlistId,
      },
    });
    const typedData = data as components['schemas']['SynologyPlaylistWithItemsResponseDto'];
    return { data: typedData, error, playlist: typedData!.data.playlists![0]! };
  }

  async function listPlaylists() {
    const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Playlist,
        method: SynologyMethodEnum.list,
        version: 1,
        library: SynologyLibraryEnum.all,
      },
    });
    const typedData = data as components['schemas']['SynologyPlaylistResponseDto'];
    return { data: typedData, error };
  }

  async function movePlaylistItems(playlistId: string, items: (number | string)[], offset: number) {
    return api.POST('/webapi/AudioStation/playlist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Playlist,
        method: SynologyMethodEnum.updatesongs,
        version: 1,
        library: SynologyLibraryEnum.all,
        id: playlistId,
        songs: items.map((id) => (typeof id === 'number' && id > 0 ? `music_${id}` : id)).join(','),
        offset,
      },
    });
  }

  async function removeItemFromPlaylist(playlistId: string, offset: number, limit?: number) {
    return api.POST('/webapi/AudioStation/playlist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Playlist,
        method: SynologyMethodEnum.updatesongs,
        version: 1,
        library: SynologyLibraryEnum.all,
        id: playlistId,
        songs: '',
        offset,
        limit: limit || 1,
      },
    });
  }

  async function retrievePlaylistInfo(playlistId: string) {
    const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Playlist,
        method: SynologyMethodEnum.getinfo,
        version: 1,
        library: SynologyLibraryEnum.all,
        id: playlistId,
      },
    });
    const typedData = data as components['schemas']['SynologyPlaylistResponseDto'];
    return { data: typedData, error, playlist: typedData!.data.playlists![0]! };
  }

  async function updatePlaylist(
    playlistId: string,
    name: string,
    type: 'normal' | 'smart',
    conj_rule?: SmartPlaylistConjugalEnum,
    rules_json?: string,
  ) {
    const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Playlist,
        method: type === 'normal' ? SynologyMethodEnum.rename : SynologyMethodEnum.updatesmart,
        version: 1,
        library: SynologyLibraryEnum.all,
        id: playlistId,
        ...(type === 'smart' ? { name, conj_rule, rules_json } : { new_name: name }),
      },
    });
    const typedData = data as components['schemas']['SynologyPlaylistIdResponseDto'];
    return { data: typedData, error, playlistId: typedData!.data.id };
  }

  it('should create a "normal" playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    expect(playlistId).toBeDefined();
    const { playlist } = await retrievePlaylistInfo(playlistId);
    expect(playlist.name).toBe(name);
    expect(playlist.type).toBe('normal');
  });

  it('should update (rename) a "normal" playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    expect(playlistId).toBeDefined();
    const newName = `Updated playlist ${Date.now()}`;
    const { playlistId: updatedPlaylistId } = await updatePlaylist(playlistId, newName, 'normal');
    const { playlist } = await retrievePlaylistInfo(updatedPlaylistId);
    expect(playlist.name).toBe(newName);
    expect(playlist.type).toBe('normal');
  });

  it('should create a "smart" playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(
      name,
      'smart',
      SmartPlaylistConjugalEnum.and,
      JSON.stringify([
        {
          interval: 0,
          tag: 1,
          op: 1,
          tagval: 'Artist 1',
        },
      ]),
    );
    const { playlist } = await retrievePlaylistInfo(playlistId);
    expect(playlist.name).toBe(name);
    expect(playlist.type).toBe('smart');
    expect(playlist.additional.rules_conjunction).toBe('and');
    expect(playlist.additional.rules).toBeDefined();
    expect(playlist.additional.rules?.length).toBe(1);
    expect(playlist.additional.rules?.[0]?.tagval).toBe('Artist 1');
    expect(playlist.additional.rules?.[0]?.op).toBe(1);
    expect(playlist.additional.rules?.[0]?.tag).toBe(1);
    expect(playlist.additional.rules?.[0]?.interval).toBe(0);
  });

  it.only('should update a "smart" playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(
      name,
      'smart',
      SmartPlaylistConjugalEnum.and,
      JSON.stringify([
        {
          interval: 0,
          tag: 1,
          op: 1,
          tagval: 'Artist 1',
        },
      ]),
    );
    console.log('playlistid', playlistId);
    const newName = `Updated playlist ${Date.now()}`;
    const { playlistId: updatedPlaylistId } = await updatePlaylist(
      playlistId,
      newName,
      'smart',
      SmartPlaylistConjugalEnum.and,
      JSON.stringify([
        {
          interval: 1,
          tag: 2,
          op: 3,
          tagval: 'Text 2',
        },
        {
          interval: 0,
          tag: 1,
          op: 1,
          tagval: 'Artist 1',
        },
      ]),
    );
    const { playlist: updatedPlaylist } = await retrievePlaylistInfo(updatedPlaylistId);
    const playlist = updatedPlaylist;
    expect(playlist.name).toBe(newName);
    expect(playlist.type).toBe('smart');
    expect(playlist.additional.rules_conjunction).toBe('and');
    expect(playlist.additional.rules).toBeDefined();
    expect(playlist.additional.rules?.length).toBe(2);
    expect(playlist.additional.rules?.[0]?.tagval).toBe('Text 2');
    expect(playlist.additional.rules?.[0]?.op).toBe(3);
    expect(playlist.additional.rules?.[0]?.tag).toBe(2);
    expect(playlist.additional.rules?.[0]?.interval).toBe(1);
    expect(playlist.additional.rules?.[1]?.tagval).toBe('Artist 1');
    expect(playlist.additional.rules?.[1]?.op).toBe(1);
    expect(playlist.additional.rules?.[1]?.tag).toBe(1);
    expect(playlist.additional.rules?.[1]?.interval).toBe(0);
  });

  it('should delete a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    const newPlaylistId = playlistId;
    expect(newPlaylistId).toBeDefined();
    const { playlist } = await retrievePlaylistInfo(newPlaylistId);
    expect(playlist.name).toBe(name);
    expect(playlist.type).toBe('normal');
    const { error } = await deletePlaylist(newPlaylistId);
    expect(error).toBeUndefined();
    // try and reload it
    await expect(retrievePlaylistInfo(newPlaylistId)).rejects.toThrow();
  });

  it('should get "normal" playlist info', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    const newPlaylistId = playlistId;
    expect(newPlaylistId).toBeDefined();
    const { playlist } = await retrievePlaylistInfo(newPlaylistId);
    expect(playlist.name).toBe(name);
    expect(playlist.type).toBe('normal');
    expect(playlist.additional.rules_conjunction).toBeUndefined();
    expect(playlist.additional.rules).toBeUndefined();
  });

  it('should get "smart" playlist info', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(
      name,
      'smart',
      SmartPlaylistConjugalEnum.and,
      JSON.stringify([
        {
          interval: 0,
          tag: 1,
          op: 1,
          tagval: 'Artist 1',
        },
      ]),
    );
    expect(playlistId).toBeDefined();
    const { playlist } = await retrievePlaylistInfo(playlistId);
    expect(playlist.name).toBe(name);
    expect(playlist.type).toBe('smart');
    expect(playlist.additional.rules_conjunction).toBe('and');
    expect(playlist.additional.rules).toBeDefined();
    expect(playlist.additional.rules?.length).toBe(1);
    expect(playlist.additional.rules?.[0]?.tagval).toBe('Artist 1');
    expect(playlist.additional.rules?.[0]?.op).toBe(1);
    expect(playlist.additional.rules?.[0]?.tag).toBe(1);
    expect(playlist.additional.rules?.[0]?.interval).toBe(0);
  });

  it('should list playlists', async () => {
    const newPlaylist1 = await createPlaylist(`Test playlist 1 ${Date.now()}`, 'normal');
    const newPlaylist2 = await createPlaylist(`Test playlist 2 ${Date.now()}`, 'normal');
    const newPlaylist3 = await createPlaylist(`Test playlist 3 ${Date.now()}`, 'normal');
    const newPlaylist4 = await createPlaylist(`Test playlist 4 ${Date.now()}`, 'normal');
    const { data } = await listPlaylists();
    const playlists = data?.data?.playlists || [];
    expect(playlists.some((p) => p.id === newPlaylist1.playlistId)).toBe(true);
    expect(playlists.some((p) => p.id === newPlaylist2.playlistId)).toBe(true);
    expect(playlists.some((p) => p.id === newPlaylist3.playlistId)).toBe(true);
    expect(playlists.some((p) => p.id === newPlaylist4.playlistId)).toBe(true);
  });

  it('should get items from a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [1]);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(1);
    expect(playlist.additional.songs?.[0]?.id).toBeDefined();
  });

  it('should reject adding to a smart playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(
      name,
      'smart',
      SmartPlaylistConjugalEnum.and,
      JSON.stringify([
        {
          interval: 0,
          tag: 1,
          op: 1,
          tagval: 'Artist 1',
        },
      ]),
    );
    const { error } = await addItemToPlaylist(playlistId, [1]);
    expect(error).toBeDefined();
  });

  it('should add song to a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [1]);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(1);
    expect(playlist.additional.songs?.[0]?.id).toBeDefined();
  });

  it('should add radio to a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, ['radio_Station 1 http://station1.url']);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(1);
    expect(playlist.additional.songs?.[0]?.id).toBeDefined();
  });

  it('should add multiple songs and radios to a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [
      trackId1,
      trackId2,
      trackId3,
      'radio_Station 2 http://station2.url',
      'radio_Station 3 http://station3.url',
    ]);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(5);
    expect(playlist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
    expect(playlist.additional.songs?.[1]?.id).toBe(`music_${trackId2}`);
    expect(playlist.additional.songs?.[2]?.id).toBe(`music_${trackId3}`);
    expect(playlist.additional.songs?.[3]?.id).toBe(
      `remote_{"album":""\\,"artist":""\\,"cover":""\\,"duration":0\\,"title":"Station 2"}\n http://station2.url}`,
    );
    expect(playlist.additional.songs?.[4]?.id).toBe(
      `remote_{"album":""\\,"artist":""\\,"cover":""\\,"duration":0\\,"title":"Station 3"}\n http://station3.url}`,
    );
  });

  it('should remove item from a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [trackId1]);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(1);
    expect(playlist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
    await removeItemFromPlaylist(playlistId, 0);
    const { playlist: updatedPlaylist } = await getPlaylistItems(playlistId);
    expect(updatedPlaylist.additional.songs?.length).toBe(0);
  });

  it('should remove items from a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [trackId1, trackId2, trackId3]);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(3);
    expect(playlist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
    expect(playlist.additional.songs?.[1]?.id).toBe(`music_${trackId2}`);
    expect(playlist.additional.songs?.[2]?.id).toBe(`music_${trackId3}`);
    await removeItemFromPlaylist(playlistId, 1, 2);
    const { playlist: updatedPlaylist } = await getPlaylistItems(playlistId);
    expect(updatedPlaylist.additional.songs?.length).toBe(1);
    expect(updatedPlaylist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
  });

  it('should reposition remaining items from a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [trackId1, trackId2, trackId3, trackId4, trackId5]);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(5);
    expect(playlist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
    expect(playlist.additional.songs?.[0]?.position).toBe(1);
    expect(playlist.additional.songs?.[1]?.id).toBe(`music_${trackId2}`);
    expect(playlist.additional.songs?.[1]?.position).toBe(2);
    expect(playlist.additional.songs?.[2]?.id).toBe(`music_${trackId3}`);
    expect(playlist.additional.songs?.[2]?.position).toBe(3);
    expect(playlist.additional.songs?.[3]?.id).toBe(`music_${trackId4}`);
    expect(playlist.additional.songs?.[3]?.position).toBe(4);
    expect(playlist.additional.songs?.[4]?.id).toBe(`music_${trackId5}`);
    expect(playlist.additional.songs?.[4]?.position).toBe(5);
    await removeItemFromPlaylist(playlistId, 1, 2);
    const { playlist: updatedPlaylist } = await getPlaylistItems(playlistId);
    expect(updatedPlaylist.additional.songs?.length).toBe(3);
    expect(updatedPlaylist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
    expect(updatedPlaylist.additional.songs?.[0]?.position).toBe(1);
    expect(updatedPlaylist.additional.songs?.[1]?.id).toBe(`music_${trackId4}`);
    expect(updatedPlaylist.additional.songs?.[1]?.position).toBe(2);
    expect(updatedPlaylist.additional.songs?.[2]?.id).toBe(`music_${trackId5}`);
    expect(updatedPlaylist.additional.songs?.[2]?.position).toBe(3);
  });

  it('should move items up a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [trackId1, trackId2, trackId3, trackId4, trackId5]);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(5);
    expect(playlist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
    expect(playlist.additional.songs?.[0]?.position).toBe(1);
    expect(playlist.additional.songs?.[1]?.id).toBe(`music_${trackId2}`);
    expect(playlist.additional.songs?.[1]?.position).toBe(2);
    expect(playlist.additional.songs?.[2]?.id).toBe(`music_${trackId3}`);
    expect(playlist.additional.songs?.[2]?.position).toBe(3);
    expect(playlist.additional.songs?.[3]?.id).toBe(`music_${trackId4}`);
    expect(playlist.additional.songs?.[3]?.position).toBe(4);
    expect(playlist.additional.songs?.[4]?.id).toBe(`music_${trackId5}`);
    expect(playlist.additional.songs?.[4]?.position).toBe(5);
    await movePlaylistItems(playlistId, [trackId3, trackId4], 1);
    const { playlist: updatedPlaylist } = await getPlaylistItems(playlistId);
    expect(updatedPlaylist.additional.songs?.length).toBe(5);
    expect(updatedPlaylist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
    expect(updatedPlaylist.additional.songs?.[0]?.position).toBe(1);
    expect(updatedPlaylist.additional.songs?.[1]?.id).toBe(`music_${trackId3}`);
    expect(updatedPlaylist.additional.songs?.[1]?.position).toBe(2);
    expect(updatedPlaylist.additional.songs?.[2]?.id).toBe(`music_${trackId4}`);
    expect(updatedPlaylist.additional.songs?.[2]?.position).toBe(3);
    expect(updatedPlaylist.additional.songs?.[3]?.id).toBe(`music_${trackId2}`);
    expect(updatedPlaylist.additional.songs?.[3]?.position).toBe(4);
    expect(updatedPlaylist.additional.songs?.[4]?.id).toBe(`music_${trackId5}`);
    expect(updatedPlaylist.additional.songs?.[4]?.position).toBe(5);
  });

  it('should move disparate items up a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [trackId1, trackId2, trackId3, trackId4, trackId5]);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(5);
    expect(playlist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
    expect(playlist.additional.songs?.[0]?.position).toBe(1);
    expect(playlist.additional.songs?.[1]?.id).toBe(`music_${trackId2}`);
    expect(playlist.additional.songs?.[1]?.position).toBe(2);
    expect(playlist.additional.songs?.[2]?.id).toBe(`music_${trackId3}`);
    expect(playlist.additional.songs?.[2]?.position).toBe(3);
    expect(playlist.additional.songs?.[3]?.id).toBe(`music_${trackId4}`);
    expect(playlist.additional.songs?.[3]?.position).toBe(4);
    expect(playlist.additional.songs?.[4]?.id).toBe(`music_${trackId5}`);
    expect(playlist.additional.songs?.[4]?.position).toBe(5);
    await movePlaylistItems(playlistId, [trackId4, trackId5], 0);
    const { playlist: updatedPlaylist } = await getPlaylistItems(playlistId);
    expect(updatedPlaylist.additional.songs?.length).toBe(5);
    expect(updatedPlaylist.additional.songs?.[0]?.id).toBe(`music_${trackId4}`);
    expect(updatedPlaylist.additional.songs?.[0]?.position).toBe(1);
    expect(updatedPlaylist.additional.songs?.[1]?.id).toBe(`music_${trackId5}`);
    expect(updatedPlaylist.additional.songs?.[1]?.position).toBe(2);
    expect(updatedPlaylist.additional.songs?.[2]?.id).toBe(`music_${trackId1}`);
    expect(updatedPlaylist.additional.songs?.[2]?.position).toBe(3);
    expect(updatedPlaylist.additional.songs?.[3]?.id).toBe(`music_${trackId2}`);
    expect(updatedPlaylist.additional.songs?.[3]?.position).toBe(4);
    expect(updatedPlaylist.additional.songs?.[4]?.id).toBe(`music_${trackId3}`);
    expect(updatedPlaylist.additional.songs?.[4]?.position).toBe(5);
  });

  it('should move items down a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [trackId1, trackId2, trackId3, trackId4, trackId5]);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(5);
    expect(playlist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
    expect(playlist.additional.songs?.[0]?.position).toBe(1);
    expect(playlist.additional.songs?.[1]?.id).toBe(`music_${trackId2}`);
    expect(playlist.additional.songs?.[1]?.position).toBe(2);
    expect(playlist.additional.songs?.[2]?.id).toBe(`music_${trackId3}`);
    expect(playlist.additional.songs?.[2]?.position).toBe(3);
    expect(playlist.additional.songs?.[3]?.id).toBe(`music_${trackId4}`);
    expect(playlist.additional.songs?.[3]?.position).toBe(4);
    expect(playlist.additional.songs?.[4]?.id).toBe(`music_${trackId5}`);
    expect(playlist.additional.songs?.[4]?.position).toBe(5);
    await movePlaylistItems(playlistId, [trackId1, trackId2], 3);
    const { playlist: updatedPlaylist } = await getPlaylistItems(playlistId);
    expect(updatedPlaylist.additional.songs?.length).toBe(5);
    expect(updatedPlaylist.additional.songs?.[0]?.id).toBe(`music_${trackId3}`);
    expect(updatedPlaylist.additional.songs?.[0]?.position).toBe(1);
    expect(updatedPlaylist.additional.songs?.[1]?.id).toBe(`music_${trackId4}`);
    expect(updatedPlaylist.additional.songs?.[1]?.position).toBe(2);
    expect(updatedPlaylist.additional.songs?.[2]?.id).toBe(`music_${trackId5}`);
    expect(updatedPlaylist.additional.songs?.[2]?.position).toBe(3);
    expect(updatedPlaylist.additional.songs?.[3]?.id).toBe(`music_${trackId1}`);
    expect(updatedPlaylist.additional.songs?.[3]?.position).toBe(4);
    expect(updatedPlaylist.additional.songs?.[4]?.id).toBe(`music_${trackId2}`);
    expect(updatedPlaylist.additional.songs?.[4]?.position).toBe(5);
  });

  it('should move disparate items down a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const { playlistId } = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [trackId1, trackId2, trackId3, trackId4, trackId5]);
    const { playlist } = await getPlaylistItems(playlistId);
    expect(playlist.additional.songs).toBeDefined();
    expect(playlist.additional.songs?.length).toBe(5);
    expect(playlist.additional.songs?.[0]?.id).toBe(`music_${trackId1}`);
    expect(playlist.additional.songs?.[0]?.position).toBe(1);
    expect(playlist.additional.songs?.[1]?.id).toBe(`music_${trackId2}`);
    expect(playlist.additional.songs?.[1]?.position).toBe(2);
    expect(playlist.additional.songs?.[2]?.id).toBe(`music_${trackId3}`);
    expect(playlist.additional.songs?.[2]?.position).toBe(3);
    expect(playlist.additional.songs?.[3]?.id).toBe(`music_${trackId4}`);
    expect(playlist.additional.songs?.[3]?.position).toBe(4);
    expect(playlist.additional.songs?.[4]?.id).toBe(`music_${trackId5}`);
    expect(playlist.additional.songs?.[4]?.position).toBe(5);
    await movePlaylistItems(playlistId, [trackId1, trackId4], 4);
    const { playlist: updatedPlaylist } = await getPlaylistItems(playlistId);
    expect(updatedPlaylist.additional.songs?.length).toBe(5);
    expect(updatedPlaylist.additional.songs?.[0]?.id).toBe(`music_${trackId2}`);
    expect(updatedPlaylist.additional.songs?.[0]?.position).toBe(1);
    expect(updatedPlaylist.additional.songs?.[1]?.id).toBe(`music_${trackId3}`);
    expect(updatedPlaylist.additional.songs?.[1]?.position).toBe(2);
    expect(updatedPlaylist.additional.songs?.[2]?.id).toBe(`music_${trackId5}`);
    expect(updatedPlaylist.additional.songs?.[2]?.position).toBe(3);
    expect(updatedPlaylist.additional.songs?.[3]?.id).toBe(`music_${trackId1}`);
    expect(updatedPlaylist.additional.songs?.[3]?.position).toBe(4);
    expect(updatedPlaylist.additional.songs?.[4]?.id).toBe(`music_${trackId4}`);
    expect(updatedPlaylist.additional.songs?.[4]?.position).toBe(5);
  });
});
