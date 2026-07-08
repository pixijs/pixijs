import { getWebGLRenderer } from '@test-utils';
import { RenderTexture } from '~/rendering';
import { Container } from '~/scene';

import type { WebGLRenderer } from '~/rendering';

function createCanvas(width = 16, height = 16)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

// drawImage into a scratch canvas reads back the presented main canvas
function readPixel(canvas: HTMLCanvasElement, x: number, y: number)
{
    const scratch = createCanvas(canvas.width, canvas.height);
    const context = scratch.getContext('2d');

    context.drawImage(canvas, 0, 0);

    return [...context.getImageData(x, y, 1, 1).data];
}

describe('Standalone clear FBO restore (WebGL)', () =>
{
    it('restores the main framebuffer after a standalone clear to a different target', async () =>
    {
        // render a frame to the main canvas so renderTargetSystem.renderTarget = main and its
        // (null) framebuffer is the live binding
        const renderer = (await getWebGLRenderer({
            width: 16,
            height: 16,
            multiView: true,
            background: 0x00ff00,
        })) as WebGLRenderer;

        const main = renderer.canvas as HTMLCanvasElement;

        renderer.render({ container: new Container() });

        const mainTarget = renderer.renderTarget.renderTarget;

        // a RenderTexture has a real FBO distinct from the main target's null framebuffer
        const rtA = RenderTexture.create({ width: 16, height: 16 });

        // standalone clear (no render in progress) binds rtA's FBO, clears it red, then must restore
        // the framebuffer to the main target
        renderer.clear({ target: rtA, clearColor: [1, 0, 0, 1] });

        // the live binding is still the main target (it was never pushed for rtA)
        expect(renderer.renderTarget.renderTarget).toBe(mainTarget);

        // no-target in-place clear of the main canvas. main === renderTargetSystem.renderTarget, so the
        // adaptor skips the bind and relies on the framebuffer the prior standalone clear left bound.
        // Without the restore that framebuffer was rtA's stale FBO and this blue landed on rtA, not main.
        renderer.clear({ clearColor: [0, 0, 1, 1] });

        // the in-place clear landed on the main canvas, not on rtA
        expect(readPixel(main, 8, 8)).toEqual([0, 0, 255, 255]);

        // and the standalone clear's red is still present on rtA (it was not overwritten by the blue)
        const rtaPixels = renderer.extract.pixels(rtA).pixels;

        expect([rtaPixels[0], rtaPixels[1], rtaPixels[2], rtaPixels[3]]).toEqual([255, 0, 0, 255]);

        rtA.destroy(true);
        renderer.destroy();
    });
});

// WebGPU self-creates a command encoder per standalone clear and draws directly to each target, so
// there is no shared currently-bound framebuffer to leave stale. The stale-FBO restore is GL-specific,
// so there is no meaningful WebGPU mirror for this fix.
