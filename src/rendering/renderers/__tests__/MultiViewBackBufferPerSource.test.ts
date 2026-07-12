import { getWebGLRenderer } from '@test-utils';
import { Container } from '~/scene';

import type { TextureSource } from '~/rendering';

function createCanvas(width: number, height: number)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

describe('MultiView back buffer per-source (WebGL)', () =>
{
    it('keeps a stable back-buffer texture per view across alternating different-size renders', async () =>
    {
        const renderer = await getWebGLRenderer({
            width: 64,
            height: 64,
            multiView: true,
            useBackBuffer: true,
        });

        const viewA = createCanvas(32, 32);
        const viewB = createCanvas(48, 16);

        const sourceA = renderer.renderTarget.getRenderTarget(viewA).colorTexture as TextureSource;
        const sourceB = renderer.renderTarget.getRenderTarget(viewB).colorTexture as TextureSource;

        const backBufferTextures = renderer.backBuffer['_backBufferTextures'] as
            Map<TextureSource, { source: TextureSource }>;

        renderer.render({ container: new Container(), target: viewA });

        // the back buffer for viewA's source, captured after its first render
        const backAUid = backBufferTextures.get(sourceA).source.uid;

        // alternate to a different-size view and back; a single shared back buffer would resize (and
        // destroy/recreate its GL texture) on each switch, minting a fresh source uid for viewA
        renderer.render({ container: new Container(), target: viewB });
        renderer.render({ container: new Container(), target: viewA });

        expect(backBufferTextures.get(sourceA).source.uid).toBe(backAUid);

        // each view has its own distinct back buffer, so they never clobber each other
        expect(backBufferTextures.get(sourceB).source.uid).not.toBe(backAUid);

        renderer.destroy();
    });
});
