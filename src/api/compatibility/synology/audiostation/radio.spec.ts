import {
  ShoutcastContainerNamesEnum,
  ShoutcastItemTypeEnum,
  SynologyApiEnum,
  SynologyMethodEnum,
  type components,
} from '../../../../types/api-schema';
import { type SynologyApiClient, createSynologyApi } from '../../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { testApi } from '../../../../test-helper';

describe('/webapi/AudioStation/radio.cgi', () => {
  let api: Awaited<SynologyApiClient>;
  let accountId: number;

  beforeAll(async () => {
    const username = `favorites-user-${Date.now()}`;
    const account = await testApi.createAccount(username);
    accountId = account.id;
    if (!accountId) {
      throw new Error(`Failed to create test account`);
    }
    api = await createSynologyApi();
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function createStation(
    container: ShoutcastContainerNamesEnum.User_defined | ShoutcastContainerNamesEnum.My_favorite,
    title: string,
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
          },
        ]),
      },
    });
  }

  async function deleteStation(
    container: ShoutcastContainerNamesEnum.User_defined | ShoutcastContainerNamesEnum.My_favorite,
    stationIndex: number,
  ) {
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
          },
        ]),
      },
    });
  }

  async function listStationsInContainer(container: ShoutcastContainerNamesEnum | string) {
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

  async function getStationIndex(container: ShoutcastContainerNamesEnum, title: string, url: string) {
    const { data, error } = await listStationsInContainer(container);
    const typedData = data as components['schemas']['SynologyRadioItemResponseDto'];
    return {
      data: typedData,
      error,
      stationIndex: typedData?.data.radios.findIndex((item) => item.title === title && item.url === url),
    };
  }

  it('should add a new user-defined station', async () => {
    const title = `Test User-Defined Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation(ShoutcastContainerNamesEnum.User_defined, title, url);
    const { radios } = await listStationsInContainer(ShoutcastContainerNamesEnum.User_defined);
    expect(radios.some((item) => item.title === title && item.url === url)).toBe(true);
  });

  it('should update an existing user-defined station', async () => {
    // create the station
    const title = `Test Updating User-Defined Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation(ShoutcastContainerNamesEnum.User_defined, title, url);
    // get the station index
    const { stationIndex } = await getStationIndex(ShoutcastContainerNamesEnum.User_defined, title, url);
    // update the station
    const updatedTitle = `${title} - Updated`;
    const updatedUrl = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation(ShoutcastContainerNamesEnum.User_defined, updatedTitle, updatedUrl, stationIndex);
    // verify update
    const { radios } = await listStationsInContainer(ShoutcastContainerNamesEnum.User_defined);
    expect(radios.some((item) => item.title === updatedTitle && item.url === updatedUrl)).toBe(true);
  });

  it('should delete an existing user-defined station', async () => {
    // create the station
    const title = `Test Deleting User-Defined Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation(ShoutcastContainerNamesEnum.User_defined, title, url);
    // get the station index
    const { stationIndex } = await getStationIndex(ShoutcastContainerNamesEnum.User_defined, title, url);
    // delete the station
    await deleteStation(ShoutcastContainerNamesEnum.User_defined, stationIndex);
    // verify delete
    const { radios } = await listStationsInContainer(ShoutcastContainerNamesEnum.User_defined);
    expect(radios.some((item) => item.title === title && item.url === url)).toBe(false);
  });

  it('should add a new favorite station', async () => {
    const title = `Test Adding Favorite Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation(ShoutcastContainerNamesEnum.My_favorite, title, url);
    const { radios } = await listStationsInContainer(ShoutcastContainerNamesEnum.My_favorite);
    expect(radios.some((item) => item.title === title && item.url === url)).toBe(true);
  });

  it('should update an existing favorite station', async () => {
    // create the station
    const title = `Test Updating Favorite Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation(ShoutcastContainerNamesEnum.My_favorite, title, url);
    // get the station index
    const { stationIndex } = await getStationIndex(ShoutcastContainerNamesEnum.My_favorite, title, url);
    // update the station
    const updatedTitle = `${title} - Updated`;
    await createStation(ShoutcastContainerNamesEnum.My_favorite, updatedTitle, url, stationIndex);
    // verify update
    const { radios } = await listStationsInContainer(ShoutcastContainerNamesEnum.My_favorite);
    expect(radios.some((item) => item.title === updatedTitle && item.url === url)).toBe(true);
  });

  it('should delete an existing favorite station', async () => {
    // create the station
    const title = `Test Deleting Favorite Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation(ShoutcastContainerNamesEnum.My_favorite, title, url);
    // get the station index
    const { stationIndex } = await getStationIndex(ShoutcastContainerNamesEnum.My_favorite, title, url);
    // delete the station
    await deleteStation(ShoutcastContainerNamesEnum.My_favorite, stationIndex);
    // verify delete
    const { radios } = await listStationsInContainer(ShoutcastContainerNamesEnum.My_favorite);
    expect(radios.some((item) => item.title === title && item.url === url)).toBe(false);
  });

  it('should list all containers', async () => {
    const { radios } = await listRadioContainers();
    expect(radios.length).toBe(3);
    expect(radios.every((item) => item.type === ShoutcastItemTypeEnum.container)).toBe(true);
    expect(radios[0]?.title).toBe('SHOUTcast');
    expect(radios[1]?.title).toBe('User defined');
    expect(radios[2]?.title).toBe(ShoutcastContainerNamesEnum.My_favorite);
  });

  it('should list all genres in SHOUTcast container', async () => {
    const { radios } = await listStationsInContainer(ShoutcastContainerNamesEnum.SHOUTcast);
    expect(radios.length).toBeGreaterThan(0);
    expect(radios.every((item) => item.type === ShoutcastItemTypeEnum.container)).toBe(true);
  });

  it('should list all SHOUTcast stations in container + genre', async () => {
    const { radios } = await listStationsInContainer(`${ShoutcastContainerNamesEnum.SHOUTcast}_genre_Blues`);
    expect(radios.length).toBeGreaterThan(0);
    expect(radios.every((item) => item.type === ShoutcastItemTypeEnum.station)).toBe(true);
    expect(radios.every((item) => item.url?.length > 0)).toBe(true);
  });

  it('should list all stations in user container', async () => {
    const title = `Test List All Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation(ShoutcastContainerNamesEnum.User_defined, title, url);
    const { radios } = await listStationsInContainer(ShoutcastContainerNamesEnum.User_defined);
    expect(radios.some((item) => item.title === title && item.url === url)).toBe(true);
  });
});
