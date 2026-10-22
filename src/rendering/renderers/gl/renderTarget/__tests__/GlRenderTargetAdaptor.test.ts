import '~/rendering/init';
import { getWebGLRenderer } from '@test-utils';
import { Graphics } from '~/scene';

import type { WebGLRenderer } from '../../gl/WebGLRenderer';

describe('GlRenderTargetAdaptor', () =>
{
    it('should clear previous frame when using multiView with transparent background', async () =>
    {
        const renderer = (await getWebGLRenderer({
            backgroundAlpha: 0,
            multiView: true,
            width: 32,
            height: 32,
        })) as WebGLRenderer;

        const canvas = document.createElement('canvas');

        canvas.width = 32;
        canvas.height = 32;

        const sprite = new Graphics().rect(8, 8, 16, 16).fill('red');

        // render first frame
        renderer.render({ container: sprite, target: canvas });

        // move sprite so it no longer overlaps the original position
        sprite.position.set(0, 0);
        sprite.removeChildren();
        const sprite2 = new Graphics().rect(0, 0, 4, 4).fill('blue');

        // render second frame
        renderer.render({ container: sprite2, target: canvas });

        // read pixels from the area where the first sprite was (center of canvas)
        const ctx = canvas.getContext('2d');
        const pixel = ctx.getImageData(16, 16, 1, 1).data;

        // the center should be fully transparent (cleared), not red from the first frame
        expect(pixel[3]).toBe(0);

        renderer.destroy();
    });
});
