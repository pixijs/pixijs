describe('isWebGPUSupported', () =>
{
    beforeEach(() =>
    {
        // the result is cached per module, so each test gets fresh modules
        jest.resetModules();
    });

    async function probeWith(adapter: object | null)
    {
        const { DOMAdapter } = await import('../../environment/adapter');
        const { isWebGPUSupported } = await import('../browser/isWebGPUSupported');
        const requestDevice = jest.fn();
        const requestAdapter = jest.fn(async () => (adapter ? { ...adapter, requestDevice } : null));

        jest.spyOn(DOMAdapter.get(), 'getNavigator').mockReturnValue({ userAgent: '', gpu: { requestAdapter } as any });

        const supported = await isWebGPUSupported();

        return { supported, requestAdapter, requestDevice };
    }

    it('should report support from the adapter alone, without creating a device', async () =>
    {
        const { supported, requestAdapter, requestDevice } = await probeWith({});

        expect(supported).toBe(true);
        expect(requestAdapter).toHaveBeenCalledTimes(1);
        expect(requestDevice).not.toHaveBeenCalled();
    });

    it('should report no support when there is no adapter', async () =>
    {
        const { supported } = await probeWith(null);

        expect(supported).toBe(false);
    });
});
