describe('FarmerData', () => {
  const apiFetchFarmers = jest.fn();
  const apiRegisterFarmer = jest.fn();
  const apiDeleteFarmer = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    apiFetchFarmers.mockReset();
    apiRegisterFarmer.mockReset();
    apiDeleteFarmer.mockReset();
    jest.doMock('../ApiService', () => ({
      apiFetchFarmers,
      apiRegisterFarmer,
      apiDeleteFarmer,
    }));
  });

  it('uses server farmers and maps the API shape', async () => {
    apiFetchFarmers.mockResolvedValue([
      { id: 'server-1', name: 'Asha', village: 'Mysuru', farmSize: '2', phone: '9000000000' },
    ]);

    const { getFarmersAsync } = require('../FarmerData');
    await expect(getFarmersAsync()).resolves.toEqual([
      expect.objectContaining({
        id: 'server-1',
        name: 'Asha',
        date: expect.any(String),
      }),
    ]);
  });

  it('falls back to persisted farmers when the server is unavailable', async () => {
    apiFetchFarmers.mockRejectedValue(new Error('offline'));
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('@soilhelp_farmers_data', JSON.stringify([
      { id: 'local-1', name: 'Bala', village: 'Hassan', farmSize: '3', phone: '9111111111', date: '2026-09-23' },
    ]));

    const { getFarmersAsync } = require('../FarmerData');
    await expect(getFarmersAsync()).resolves.toEqual([
      expect.objectContaining({ id: 'local-1', name: 'Bala' }),
    ]);
  });

  it('saves a new farmer locally and notifies subscribers when registration falls back', async () => {
    apiFetchFarmers.mockRejectedValue(new Error('offline'));
    apiRegisterFarmer.mockRejectedValue(new Error('offline'));
    const { addFarmerAsync, onFarmersChange } = require('../FarmerData');
    const listener = jest.fn();
    onFarmersChange(listener);

    const farmer = await addFarmerAsync({
      name: 'Chitra',
      village: 'Mandya',
      farmSize: '1',
      phone: '9222222222',
    });

    expect(farmer.name).toBe('Chitra');
    expect(farmer.createdAt).toEqual(expect.any(String));
    expect(listener).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: farmer.id, name: 'Chitra' }),
    ]));
  });
});
