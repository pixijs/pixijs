import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { RenderTexture } from '~/rendering';
import { Container } from '~/scene';

function createCanvas(width = 16, height = 16)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    return canvas;
}

// drawImage into a scratch canvas works for 2d-presented and webgpu canvases alike
function readPixel(canvas: HTMLCanvasElement, x: number, y: number)
{
    const scratch = createCanvas(canvas.width, canvas.height);
    const context = scratch.getContext('2d');

    context.drawImage(canvas, 0, 0);

    return [...context.getImageData(x, y, 1, 1).data];
}

describe('Standalone clear to target (WebGL)', () =>
{
    it('clears a standalone secondary canvas with no render in progress', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 16, height: 16, multiView: true });

        const secondary = createCanvas(8, 8);

        // no render has happened, so the render-target stack is empty: the standalone branch must
        // clear the secondary canvas directly without binding through a (non-existent) render pass
        renderer.clear({ target: secondary, clearColor: [1, 0, 0, 1] });

        expect(readPixel(secondary, 4, 4)).toEqual([255, 0, 0, 255]);

        renderer.destroy();
    });

    it('clears the far corner of a secondary resized larger than its first use (grows the shared canvas)', async () =>
    {
        // main view and the secondary both start at 16x16, so the shared GL canvas is only 16 tall.
        // After the secondary is resized larger its gpu render target already exists (no re-init grows
        // the shared canvas), so only the standalone clear's prerender grows it. Without that growth the
        // far corner of the resized surface is never cleared/presented.
        const renderer = await getWebGLRenderer({ width: 16, height: 16, multiView: true });

        const secondary = createCanvas(16, 16);

        // first use creates the gpu render target while the secondary is still 16x16
        renderer.clear({ target: secondary, clearColor: [1, 0, 0, 1] });

        // grow the secondary (and its DOM canvas) beyond the main view / shared canvas size
        renderer.renderTarget.getRenderTarget(secondary).colorTexture.source.resize(64, 48);

        renderer.clear({ target: secondary, clearColor: [0, 1, 0, 1] });

        // read the far corner (just inside the bounds) to prove the full resized surface was cleared
        expect(readPixel(secondary, 63, 47)).toEqual([0, 255, 0, 255]);

        renderer.destroy();
    });
});

describe('Standalone clear to target (WebGPU)', () =>
{
    itLocalOnly('does not throw and reads the clear color between frames', async () =>
    {
        // WebGPU draws directly to its targets and nulls the command encoder between frames (in
        // GpuEncoderSystem.postrender); a standalone clear must route through adaptor.clear (which
        // self-creates an encoder) rather than bind -> startRenderPass -> beginRenderPass on a null
        // encoder. Render once first so the encoder is nulled, reproducing the between-frames state.
        const renderer = await getWebGPURenderer({ width: 16, height: 16 });

        renderer.render({ container: new Container() });

        const secondary = createCanvas(8, 8);

        expect(() => renderer.clear({ target: secondary, clearColor: [1, 0, 0, 1] })).not.toThrow();

        expect(readPixel(secondary, 4, 4)).toEqual([255, 0, 0, 255]);

        renderer.destroy();
    });
});

describe('Between-render clear to target with back buffer (WebGL)', () =>
{
    it('leaves the live binding on canvasA after a between-render clear to canvasB', async () =>
    {
        // with useBackBuffer the main render goes through an intermediate texture and the back-buffer
        // present binds canvasA's source as the live target (without pushing it on the stack), so the
        // live binding is ahead of the stack top. A between-render clear({ target: canvasB }) must take
        // the standalone path and not bind canvasB, so the live target stays resolved to canvasA.
        const renderer = await getWebGLRenderer({
            width: 16,
            height: 16,
            multiView: true,
            useBackBuffer: true,
            background: 0x00ff00,
        });

        const canvasA = createCanvas(16, 16);
        const canvasB = createCanvas(16, 16);

        renderer.render({ container: new Container(), target: canvasA });

        // the render is finished (stack empty), so this is a standalone clear of a different canvas
        renderer.clear({ target: canvasB, clearColor: [0, 0, 1, 1] });

        const canvasATarget = renderer.renderTarget.getRenderTarget(canvasA);

        // the standalone clear must not have rebound the live target to canvasB
        expect(renderer.renderTarget.renderTarget).toBe(canvasATarget);

        // the clear still landed on canvasB
        expect(readPixel(canvasB, 8, 8)).toEqual([0, 0, 255, 255]);

        renderer.destroy();
    });

    it('restores the live binding (not the stack top) after a mid-render clear to another canvas', async () =>
    {
        // reproduce the back-buffer-present state where the live binding is ahead of the stack: push
        // canvasA (stack top), then bind a texture surface WITHOUT pushing so live != stack top. A
        // mid-render clear({ target: canvasB }) must restore the LIVE binding (the texture), not the
        // stack top (canvasA). The old stack-top restore would corrupt the active binding to canvasA.
        const renderer = await getWebGLRenderer({ width: 16, height: 16, multiView: true });

        const canvasA = createCanvas(16, 16);
        const canvasB = createCanvas(16, 16);
        const texture = RenderTexture.create({ width: 16, height: 16 });

        const renderTarget = renderer.renderTarget;

        renderTarget.push(canvasA, false);
        // live binding moves ahead of the stack top (canvasA) without a matching push
        renderTarget.bind(texture, false);

        const liveTarget = renderTarget.getRenderTarget(texture);

        renderTarget.clear(canvasB, true, [0, 0, 1, 1]);

        // the live binding is back on the texture, not the canvasA left on the stack top
        expect(renderTarget.renderTarget).toBe(liveTarget);
        expect(renderTarget.renderSurface).toBe(texture);

        renderer.destroy();
    });
});

describe('destroy preserves user view-canvas sources (WebGL)', () =>
{
    it('does not destroy an addView canvas source on renderer destroy', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });

        const canvas = createCanvas();

        document.body.appendChild(canvas);

        const view = renderer.addView({ canvas });
        const { source } = view;

        renderer.destroy();

        expect(source.destroyed).toBe(false);

        canvas.remove();
    });

    it('still destroys an implicitly created render({ target }) canvas source', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });

        const canvas = createCanvas();

        // implicit target (no addView): the source is owned by the render-target system, so destroy
        // must still tear it down
        renderer.render({ container: new Container(), target: canvas });

        const source = renderer.renderTarget.getRenderTarget(canvas).colorTexture;

        renderer.destroy();

        expect(source.destroyed).toBe(true);
    });
});
