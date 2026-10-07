import { ShoutcastItemTypeEnum, SynologyApiEnum, SynologyMethodEnum, type components } from '../../types/api-schema';
import { type SynologyApiClient, createSynologyApi } from '../../test-helper';
import { USER_USERNAME, createTestApi } from '../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/radio.cgi', () => {
  let api: Awaited<SynologyApiClient>;
  let accountId: number;

  beforeAll(async () => {
    const username = `favorites-user-${Date.now()}`;
    const testApi = await createTestApi();
    const account = await testApi.duplicateAccount(USER_USERNAME, username);
    accountId = account.data?.accountId || 0;
    if (!accountId) {
      throw new Error(`Failed to create test account`);
    }
    api = await createSynologyApi();
  }, 120_000);

  afterAll(async () => {
    const testApi = await createTestApi();
    await testApi.deleteAccount(accountId);
  });

  async function createStation(
    container: 'User defined' | 'My favorite',
    title: string,
    desc: string,
    url: string,
    offset = -1,
  ) {
    return api.POST('/webapi/AudioStation/radio.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Radio,
        container,
        method: SynologyMethodEnum.updateradios,
        version: 1,
        offset,
        limit: 0,
        radios_json: JSON.stringify([
          {
            title,
            url,
            desc,
          },
        ]),
      },
    });
  }

  async function deleteStation(container: 'User defined' | 'My favorite', stationIndex: number) {
    return api.POST('/webapi/AudioStation/radio.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Radio,
        container,
        method: SynologyMethodEnum.updateradios,
        version: 1,
        offset: stationIndex,
        limit: 0,
        radios_json: JSON.stringify([
          {
            title: '',
            url: '',
            desc: '',
          },
        ]),
      },
    });
  }

  async function listStationsInContainer(container: 'User defined' | 'My favorite' | 'SHOUTcast' | string) {
    const { data, error } = await api.POST('/webapi/AudioStation/radio.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Radio,
        container,
        method: SynologyMethodEnum.list,
        version: 1,
        offset: 0,
        limit: 100000,
      },
    });
    const typedData = data as components['schemas']['SynologyRadioItemResponseDto'];
    return {
      data: typedData,
      error,
      radios: typedData?.data.radios || [],
      total: typedData?.data.total || 0,
    };
  }

  async function listRadioContainers() {
    const { data, error } = await api.POST('/webapi/AudioStation/radio.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Radio,
        method: SynologyMethodEnum.list,
        version: 1,
        offset: 0,
        limit: 100000,
      },
    });
    const typedData = data as components['schemas']['SynologyRadioItemResponseDto'];
    return {
      data: typedData,
      error,
      radios: typedData?.data.radios || [],
      total: typedData?.data.total || 0,
    };
  }

  async function getStationIndex(
    container: 'User defined' | 'My favorite' | 'SHOUTcast' | string,
    title: string,
    url: string,
  ) {
    const { data, error } = await listStationsInContainer(container);
    const typedData = data as components['schemas']['SynologyRadioItemResponseDto'];
    return {
      data: typedData,
      error,
      stationIndex: typedData?.data.radios.findIndex((item) => item.title === title && item.url === url),
    };
  }

  it('should add a new user-defined station', async () => {
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation('User defined', title, 'A test station for unit testing', url);
    const { radios } = await listStationsInContainer('User defined');
    expect(radios.some((item) => item.title === title && item.url === url)).toBe(true);
  });

  it('should update an existing user-defined station', async () => {
    // create the station
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation('User defined', title, 'A test station for unit testing', url);
    // get the station index
    const { stationIndex } = await getStationIndex('User defined', title, url);
    // update the station
    const updatedTitle = `${title} - Updated`;
    const updatedDesc = 'An updated test station for unit testing';
    const updatedUrl = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation('User defined', updatedTitle, updatedDesc, updatedUrl, stationIndex);
    // verify update
    const { radios } = await listStationsInContainer('User defined');
    expect(
      radios.some((item) => item.title === updatedTitle && item.url === updatedUrl && item.desc === updatedDesc),
    ).toBe(true);
  });

  it('should delete an existing user-defined station', async () => {
    // create the station
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation('User defined', title, 'Another test station for unit testing', url);
    // get the station index
    const { stationIndex } = await getStationIndex('User defined', title, url);
    // delete the station
    await deleteStation('User defined', stationIndex);
    // verify delete
    const { radios } = await listStationsInContainer('User defined');
    expect(radios.some((item) => item.title === title && item.url === url)).toBe(false);
  });

  it('should add a new favorite station', async () => {
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation('My favorite', title, 'A test station for unit testing', url);
    const { radios } = await listStationsInContainer('My favorite');
    expect(radios.some((item) => item.title === title && item.url === url)).toBe(true);
  });

  it('should update an existing favorite station', async () => {
    // create the station
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation('My favorite', title, 'A test station for unit testing', url);
    // get the station index
    const { stationIndex } = await getStationIndex('My favorite', title, url);
    // update the station
    const updatedTitle = `${title} - Updated`;
    await createStation('My favorite', updatedTitle, 'A test station for unit testing', url, stationIndex);
    // verify update
    const { radios } = await listStationsInContainer('My favorite');
    expect(radios.some((item) => item.title === updatedTitle && item.url === url)).toBe(true);
  });

  it('should delete an existing favorite station', async () => {
    // create the station
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation('My favorite', title, 'Another test station for unit testing', url);
    // get the station index
    const { stationIndex } = await getStationIndex('My favorite', title, url);
    // delete the station
    await deleteStation('My favorite', stationIndex);
    // verify delete
    const { radios } = await listStationsInContainer('My favorite');
    expect(radios.some((item) => item.title === title && item.url === url)).toBe(false);
  });

  it('should list all containers', async () => {
    const { radios } = await listRadioContainers();
    expect(radios.length).toBe(3);
    expect(radios.every((item) => item.type === ShoutcastItemTypeEnum.container)).toBe(true);
    expect(radios[0]?.title).toBe('SHOUTcast');
    expect(radios[1]?.title).toBe('User defined');
    expect(radios[2]?.title).toBe('My favorite');
  });

  it('should list all genres in SHOUTcast container', async () => {
    const { radios } = await listStationsInContainer('SHOUTcast');
    expect(radios.length).toBeGreaterThan(0);
    expect(radios.every((item) => item.type === ShoutcastItemTypeEnum.container)).toBe(true);
  });

  it('should list all SHOUTcast stations in container + genre', async () => {
    const { radios } = await listStationsInContainer('SHOUTcast_genre_Blues');
    expect(radios.length).toBeGreaterThan(0);
    expect(radios.every((item) => item.type === ShoutcastItemTypeEnum.station)).toBe(true);
    expect(radios.every((item) => item.url?.length > 0)).toBe(true);
  });

  it('should list all stations in user container', async () => {
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation('User defined', title, 'A test station for unit testing', url);
    const { radios } = await listStationsInContainer('User defined');
    expect(radios.some((item) => item.title === title && item.url === url)).toBe(true);
  });
});
