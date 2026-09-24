describe('ApiService fallbacks and errors', () => {
  beforeEach(() => {
    jest.resetModules();
    global.fetch = jest.fn();
    jest.doMock('../ServerConfig', () => ({
      getServerBaseUrl: jest.fn().mockResolvedValue('http://test-server:8000'),
      getCachedServerUrl: jest.fn().mockReturnValue('http://test-server:8000'),
    }));
  });

  it('throws a useful error when sample registration cannot reach the server', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));
    const { apiRegisterSample } = require('../ApiService');

    await expect(apiRegisterSample({
      sampleId: 'SH-TEST-2',
      farmerName: 'Asha',
      acres: '2',
      village: 'Mysuru',
    })).rejects.toThrow('Cannot reach server at http://test-server:8000');
  });

  it('surfaces API error details for a failed farmer registration', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 422,
      json: jest.fn().mockResolvedValue({ detail: 'Invalid farmer data' }),
    });
    const { apiRegisterFarmer } = require('../ApiService');

    await expect(apiRegisterFarmer({
      name: 'Asha',
      village: 'Mysuru',
      farmSize: '2',
      phone: '9000000000',
    })).rejects.toThrow('Invalid farmer data');
  });
});
