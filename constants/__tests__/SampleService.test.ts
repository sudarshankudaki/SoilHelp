describe('SampleService', () => {
  const apiFetchSamples = jest.fn();
  const apiRegisterSample = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    apiFetchSamples.mockReset();
    apiRegisterSample.mockReset();
    jest.doMock('../ApiService', () => ({
      apiFetchSamples,
      apiRegisterSample,
    }));
  });

  const sample = {
    sampleId: 'SH-TEST-1',
    farmerName: 'Asha',
    acres: '2',
    village: 'Mysuru',
    collectionDate: '23 Sep 2026',
    status: 'collected' as const,
    statusLabel: 'Collected',
    timeline: { collectedDate: '23 Sep 2026' },
  };

  it('uses server samples when available', async () => {
    apiFetchSamples.mockResolvedValue([{
      id: 'server-1',
      ...sample,
      timeline: { collectedDate: sample.collectionDate },
    }]);
    const { getSamples } = require('../SampleService');

    await expect(getSamples()).resolves.toEqual([
      expect.objectContaining({ id: 'server-1', sampleId: 'SH-TEST-1' }),
    ]);
  });

  it('falls back to persisted samples when the server is unavailable', async () => {
    apiFetchSamples.mockRejectedValue(new Error('offline'));
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('@soilhelp_samples_data', JSON.stringify([
      { id: 'local-1', ...sample },
    ]));
    const { getSamples } = require('../SampleService');

    await expect(getSamples()).resolves.toEqual([
      expect.objectContaining({ id: 'local-1', sampleId: 'SH-TEST-1' }),
    ]);
  });

  it('creates an offline sample and notifies subscribers when fallback mode is enabled', async () => {
    apiFetchSamples.mockRejectedValue(new Error('offline'));
    apiRegisterSample.mockRejectedValue(new Error('offline'));
    const { addSample, onSamplesChange } = require('../SampleService');
    const listener = jest.fn();
    onSamplesChange(listener);

    const saved = await addSample(sample, { requireServer: false });

    expect(saved).toEqual(expect.objectContaining({
      sampleId: 'SH-TEST-1',
      createdAt: expect.any(String),
    }));
    expect(listener).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ sampleId: 'SH-TEST-1' }),
    ]));
  });
});
