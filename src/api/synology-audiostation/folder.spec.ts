import { type SynologyApiClient, createSynologyApi } from '../../test-helper';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum, components } from '../../types/api-schema';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/folder.cgi', () => {
  let api: Awaited<SynologyApiClient>;

  beforeAll(async () => {
    api = await createSynologyApi();
  });

  async function listFolders(id?: string, offset?: number, limit?: number) {
    const { data, error } = await api.POST('/webapi/AudioStation/folder.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Folder,
        method: SynologyMethodEnum.list,
        version: 1,
        library: SynologyLibraryEnum.all,
        id,
        offset: offset || 0,
        limit: limit || 100000,
      },
    });
    const typedData = data as components['schemas']['SynologyFolderResponseDto'];
    return {
      data: typedData,
      error,
      folders: typedData?.data.items || [],
      total: typedData?.data.total || 0,
    };
  }

  it('should list root folders', async () => {
    const { folders } = await listFolders();
    expect(folders.length).toBe(3);
    expect(folders[0]?.path).toBe('Artist 1');
    expect(folders[1]?.path).toBe('Artist 2');
    expect(folders[2]?.path).toBe('Artist 3');
  });

  it('should list folders under a root folder', async () => {
    const { folders } = await listFolders('dir_1');
    expect(folders.length).toBe(2);
    expect(folders[0]?.title).toBe('Album 1');
    expect(folders[1]?.title).toBe('Album 2');
  });

  it('should list folders under a nested folder', async () => {
    const { folders } = await listFolders('dir_2');
    expect(folders.length).toBe(5);
    expect(folders[0]?.title).toBe('01 First Track.flac');
    expect(folders[1]?.title).toBe('02 Second Track.m4a');
    expect(folders[2]?.title).toBe('03 Third Track.mp3');
    expect(folders[3]?.title).toBe('04 Fourth Track.ogg');
    expect(folders[4]?.title).toBe('05 Fifth Track.ogg');
  });

  it('should list folders under a deeper-nested folder', async () => {
    const { folders } = await listFolders('dir_3');
    expect(folders.length).toBe(2);
    expect(folders[0]?.title).toBe('CD 1');
    expect(folders[1]?.title).toBe('CD 2');
  });

  it('should list files under a deeper-nested folder', async () => {
    const { folders } = await listFolders('dir_4');
    expect(folders.length).toBe(4);
    expect(folders[0]?.title).toBe('01 First Track.flac');
    expect(folders[1]?.title).toBe('02 Second Track.flac');
    expect(folders[2]?.title).toBe('03 Third Track.flac');
    expect(folders[3]?.title).toBe('04 Fourth Track.flac');
  });

  it('should paginate folders', async () => {
    // page 1
    const { folders, total } = await listFolders('dir_1', 0, 1);
    expect(total).toBe(2);
    expect(folders.length).toBe(1);
    expect(folders[0]?.title).toBe('Album 1');
    // page 2
    const { folders: folders2, total: total2 } = await listFolders('dir_1', 1, 1);
    expect(total2).toBe(2);
    expect(folders2.length).toBe(1);
    expect(folders2[0]?.title).toBe('Album 2');
  });
});
