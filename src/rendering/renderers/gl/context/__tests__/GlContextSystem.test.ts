import { getWebGLRenderer } from '@test-utils';
import { Texture } from '~/rendering';
import { Container, Sprite } from '~/scene';

async function waitFor(condition: () => boolean, timeout = 2000): Promise<void>
{
    const start = Date.now();

    while (!condition())
    {
        if (Date.now() - start > timeout) throw new Error('Timed out waiting for condition');
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
}

describe('GlContextSystem', () =>
{
    it('should restore the context after an externally-triggered context loss', async () =>
    {
        const renderer = await getWebGLRenderer();

        try
        {
            const ext = renderer.context.extensions.loseContext;

            expect(ext).toBeTruthy();

            // An external context loss — a real GPU crash, or an app calling
            // WEBGL_lose_context.loseContext() directly. This is NOT Pixi's own forceContextLoss().
            const restoreSpy = jest.spyOn(ext, 'restoreContext');

            ext.loseContext();

            // wait for the loss to actually register
            await waitFor(() => renderer.context.isLost);

            // v7 restored the context here by calling restoreContext() in handleContextLost.
            // v8 gates that call behind `_contextLossForced`, so an external loss never restores.
            await waitFor(() => !renderer.context.isLost, 1500).catch(() =>
            {
                // timing out here is expected on a broken build — the assertion below decides
            });

            expect(restoreSpy).toHaveBeenCalled();
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should keep rendering correctly after an externally-triggered context loss and recovery', async () =>
    {
        const renderer = await getWebGLRenderer();

        try
        {
            const ext = renderer.context.extensions.loseContext;

            const sprite = new Sprite(Texture.WHITE);

            sprite.width = 50;
            sprite.height = 50;

            const container = new Container();

            container.addChild(sprite);

            // render a baseline frame and confirm something was actually drawn
            renderer.render(container);
            const before = renderer.extract.pixels(container).pixels;

            expect(before.some((v) => v !== 0)).toBe(true);

            // trigger an external context loss
            ext.loseContext();
            await waitFor(() => renderer.context.isLost);

            // the renderer should recover on its own
            await waitFor(() => !renderer.context.isLost);

            // rendering must still produce output identical to the baseline
            renderer.render(container);
            const after = renderer.extract.pixels(container).pixels;

            expect(after.length).toBe(before.length);
            expect(after).toEqual(before);
        }
        finally
        {
            renderer.destroy();
        }
    });
});
