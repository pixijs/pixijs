import '~/rendering/renderers/shared/texture/Texture';
import { getWebGLRenderer } from '@test-utils';
import { Graphics } from '~/scene';
import { Container } from '~/scene/container/Container';

import type { Texture } from '~/rendering';

describe('nested render during cacheAsTexture does not corrupt the render-target stack', () =>
{
    it('does not crash when an onRender callback runs a nested generateTexture mid-cache', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 64, height: 64 });

        // a separate subtree the nested render rasterizes
        const offscreen = new Container();

        offscreen.addChild(new Graphics().rect(0, 0, 16, 16).fill(0xff0000));

        // the cached container: its subtree fires a nested renderer.generateTexture during the outer
        // render, interleaving a full nested render lifecycle with the outer cacheAsTexture push/pop.
        // Before the fix, the nested render's postrender wiped the outer render-target stack, so the
        // outer cacheAsTexture pop() underflowed and threw "Cannot read properties of undefined
        // (reading 'renderTarget')". The fix tracks render depth with a counter instead of zeroing the
        // stack in postrender, so an outer render survives a nested one.
        const generated: Texture[] = [];
        const cached = new Container();
        const inner = new Graphics().rect(0, 0, 32, 32).fill(0x00ff00);

        inner.onRender = (r) =>
        {
            // keep the generated texture (a real app reuses it) so the nested render's target is not
            // torn down mid-frame; the point under test is the outer stack surviving the nested render
            generated.push(r.generateTexture(offscreen));
        };

        cached.addChild(inner);
        cached.cacheAsTexture(true);

        const stage = new Container();

        stage.addChild(cached);

        expect(() => renderer.render(stage)).not.toThrow();
        // render again to exercise the cached path plus a second nested render
        expect(() => renderer.render(stage)).not.toThrow();

        // the cache built a texture and the renderer is still usable after the nested renders
        expect(cached.renderGroup?.texture).toBeDefined();

        renderer.destroy();
        generated.forEach((tex) => tex.destroy(true));
        offscreen.destroy({ children: true });
    });
});
