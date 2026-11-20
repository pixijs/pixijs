describe('isWebGLSupported', () =>
{
    // the result is cached at module level, so every test starts from a fresh module registry
    beforeEach(() =>
    {
        jest.resetModules();
    });

    async function load()
    {
        const { DOMAdapter } = await import('~/environment/adapter');
        const { isWebGLSupported } = await import('../browser/isWebGLSupported');

        return { DOMAdapter, isWebGLSupported };
    }

    it('should check again after a failed check', async () =>
    {
        const { DOMAdapter, isWebGLSupported } = await load();
        const adapter = DOMAdapter.get();
        const createCanvas = adapter.createCanvas;
        // the first canvas can't create a WebGL context, as when context creation fails for a moment
        const spy = jest.spyOn(adapter, 'createCanvas')
            .mockImplementationOnce(() => ({ getContext: (): null => null }) as any);

        try
        {
            expect(isWebGLSupported()).toBe(false);
            spy.mockImplementation(createCanvas);
            expect(isWebGLSupported()).toBe(true);
            expect(spy).toHaveBeenCalledTimes(2);
        }
        finally
        {
            spy.mockRestore();
        }
    });

    it('should cache a successful check', async () =>
    {
        const { DOMAdapter, isWebGLSupported } = await load();
        const spy = jest.spyOn(DOMAdapter.get(), 'createCanvas');

        try
        {
            expect(isWebGLSupported()).toBe(true);
            expect(isWebGLSupported()).toBe(true);
            expect(spy).toHaveBeenCalledTimes(1);
        }
        finally
        {
            spy.mockRestore();
        }
    });
});
