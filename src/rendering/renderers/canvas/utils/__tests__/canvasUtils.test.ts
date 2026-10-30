describe('canvasUtils', () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
    });

    async function load(multiplySupported: boolean)
    {
        const probe = await import('../canUseNewCanvasBlendModes');
        const spy = jest.spyOn(probe, 'canUseNewCanvasBlendModes').mockReturnValue(multiplySupported);
        const { canvasUtils } = await import('../canvasUtils');

        return { canvasUtils, spy };
    }

    it('should not probe canvas blend modes on import', async () =>
    {
        const { spy } = await load(true);

        expect(spy).not.toHaveBeenCalled();
    });

    it('should resolve the tint method on first read', async () =>
    {
        const { canvasUtils, spy } = await load(true);

        expect(canvasUtils.tintMethod).toBe(canvasUtils.tintWithMultiply);
        expect(canvasUtils.canUseMultiply).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should fall back to per-pixel tinting without multiply support', async () =>
    {
        const { canvasUtils } = await load(false);

        expect(canvasUtils.canUseMultiply).toBe(false);
        expect(canvasUtils.tintMethod).toBe(canvasUtils.tintWithPerPixel);
    });

    it('should keep an assigned tint method and multiply flag', async () =>
    {
        const { canvasUtils, spy } = await load(true);
        const tint = jest.fn();

        canvasUtils.canUseMultiply = false;
        canvasUtils.tintMethod = tint;

        expect(canvasUtils.canUseMultiply).toBe(false);
        expect(canvasUtils.tintMethod).toBe(tint);
        expect(spy).not.toHaveBeenCalled();
    });
});
