import { getWebGLRenderer } from '@test-utils';
import { Texture } from '~/rendering';
import { Container, Sprite } from '~/scene';

async function waitFor(condition: () => boolean, timeout = 3000): Promise<void>
{
    const start = Date.now();

    while (!condition())
    {
        if (Date.now() - start > timeout) throw new Error('Timed out waiting for condition');
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
}

// Mirrors the JSFiddle repro (vote138y/6) from issue #12134:
// "Lose Context" button does ext.loseContext(); Pixi must recover WITHOUT the (broken) Restore button.

describe('JSFiddle repro: Lose Context button flow', () =>
{
    it('recovers automatically after external loseContext(), no manual restore needed', async () =>
    {
        const renderer = await getWebGLRenderer();

        try
        {
            // --- the fiddle's scene: a square + a render ---
            const sprite = new Sprite(Texture.WHITE);

            sprite.width = 50;
            sprite.height = 50;

            const container = new Container();

            container.addChild(sprite);
            renderer.render(container);
            const before = renderer.extract.pixels(container).pixels;

            expect(before.some((v) => v !== 0)).toBe(true);

            // --- the fiddle's "Lose Context" button handler ---
            const ext = renderer.context.extensions.loseContext; // Pixi's stored ref, same as fiddle's ext

            expect(ext).toBeTruthy();

            ext.loseContext();

            // the context goes lost
            await waitFor(() => renderer.context.isLost);

            // --- WHY the fiddle's "Restore Context" button is broken ---
            // After loss, getExtension() on the dead context returns null → alert("not supported")
            const deadGl = renderer.gl;

            expect(deadGl.getExtension('WEBGL_lose_context')).toBeNull();

            // --- WITH OUR FIX: Pixi auto-restores using its stored extension ref ---
            // no manual restoreContext() call here — the fix handles it inside handleContextLost
            await waitFor(() => !renderer.context.isLost);

            // scene must be back and identical to baseline
            renderer.render(container);
            const after = renderer.extract.pixels(container).pixels;

            expect(after).toEqual(before);
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('keeps recovering across 3 repeated losses (fiddle "Auto Test (3x)" flow)', async () =>
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
            renderer.render(container);
            const baseline = renderer.extract.pixels(container).pixels;

            for (let i = 0; i < 3; i++)
            {
                ext.loseContext();
                await waitFor(() => renderer.context.isLost);
                // our fix auto-restores (no manual restoreContext)
                await waitFor(() => !renderer.context.isLost);

                renderer.render(container);
                const pixels = renderer.extract.pixels(container).pixels;

                expect(pixels).toEqual(baseline);
            }
        }
        finally
        {
            renderer.destroy();
        }
    });
});
