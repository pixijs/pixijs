import { getWebGLRenderer } from '@test-utils';
import { Container } from '~/scene';

import type { WebGLRenderer } from '~/rendering';

function createCanvas(width = 16, height = 16)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

// drawImage into a scratch canvas reads back the presented canvas
function readPixel(canvas: HTMLCanvasElement, x: number, y: number)
{
    const scratch = createCanvas(canvas.width, canvas.height);
    const context = scratch.getContext('2d');

    context.drawImage(canvas, 0, 0);

    return [...context.getImageData(x, y, 1, 1).data];
}

describe('Standalone clear with destroyed previously-bound target (WebGL)', () =>
{
    it('does not re-init a released target when clearing a different live target between frames', async () =>
    {
        const renderer = (await getWebGLRenderer({
            width: 16,
            height: 16,
            multiView: true,
            background: 0x00ff00,
        })) as WebGLRenderer;

        const canvasX = createCanvas(16, 16);
        const canvasY = createCanvas(16, 16);

        const renderTarget = renderer.renderTarget;

        // render to a raw canvas: an implicit CanvasSource is created and this canvasX target becomes
        // renderTargetSystem.renderTarget (the live binding). The render finishes, so the stack is empty.
        renderer.render({ container: new Container(), target: canvasX });

        const releasedTarget = renderTarget.getRenderTarget(canvasX);

        // sanity: the live binding still points at canvasX's target after the render
        expect(renderTarget.renderTarget).toBe(releasedTarget);

        // destroy the implicit source. releaseRenderTarget nulls _gpuRenderTargetHash[uid] and destroys the
        // RenderTarget, but leaves renderTargetSystem.renderTarget still referencing this now-dead target.
        releasedTarget.colorTexture.destroy();

        // the gpu hash entry for the released target is gone; re-resolving it would re-init a dead canvas
        // target (ensureCanvasSize on a destroyed source's null resource) and crash
        expect(renderTarget['_gpuRenderTargetHash'][releasedTarget.uid]).toBeFalsy();
        expect(renderTarget.renderTarget).toBe(releasedTarget);

        // standalone clear of a DIFFERENT live canvas. The adaptor binds canvasY's FBO, clears, then must
        // restore the framebuffer from the raw GL binding it captured, NOT by re-resolving the released
        // renderTargetSystem.renderTarget through getGpuRenderTarget (which would re-init the dead target).
        expect(() =>
            renderer.clear({ target: canvasY, clearColor: [0, 0, 1, 1] })
        ).not.toThrow();

        // canvasY received the clear color
        expect(readPixel(canvasY, 8, 8)).toEqual([0, 0, 255, 255]);

        renderer.destroy();
    });
});
