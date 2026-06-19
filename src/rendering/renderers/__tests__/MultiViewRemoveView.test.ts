import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Container } from '~/scene';

import type { Renderer } from '~/rendering';

function createCanvas(width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    document.body.appendChild(canvas);

    return canvas;
}

// adds a user canvas as a view, renders once, then exercises releaseRenderTarget on it
async function releaseScenario(renderer: Renderer)
{
    const canvas = createCanvas();

    renderer.addView({ canvas });
    renderer.render({ container: new Container(), target: canvas });

    const renderTarget = renderer.renderTarget;
    const rt = renderTarget.getRenderTarget(canvas);

    const destroySpy = jest.spyOn(renderer.renderTarget.adaptor, 'destroyGpuRenderTarget');

    renderTarget.releaseRenderTarget(canvas);

    return { canvas, rt, destroySpy };
}

describe('MultiView releaseRenderTarget', () =>
{
    it('releases the gpu render target and both hash entries while preserving the source', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const { canvas, rt, destroySpy } = await releaseScenario(renderer);

        const hash = renderer.renderTarget['_renderSurfaceToRenderTargetHash'];

        expect(destroySpy).toHaveBeenCalledTimes(1);
        expect(renderer.renderTarget['_gpuRenderTargetHash'][rt.uid]).toBeNull();
        expect(hash.has(canvas)).toBe(false);
        expect(hash.has(rt.colorTexture)).toBe(false);
        expect(rt.colorTexture.source.destroyed).toBe(false);

        const fresh = renderer.renderTarget.getRenderTarget(canvas);

        expect(fresh.uid).not.toBe(rt.uid);

        destroySpy.mockRestore();
        renderer.destroy();
        canvas.remove();
    });

    it('is a safe no-op when called a second time', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const { canvas } = await releaseScenario(renderer);

        expect(() => renderer.renderTarget.releaseRenderTarget(canvas)).not.toThrow();

        renderer.destroy();
        canvas.remove();
    });
});

describe('MultiView releaseRenderTarget (WebGPU)', () =>
{
    itLocalOnly('releases the gpu render target and both hash entries while preserving the source', async () =>
    {
        const renderer = await getWebGPURenderer({});
        const { canvas, rt, destroySpy } = await releaseScenario(renderer);

        const hash = renderer.renderTarget['_renderSurfaceToRenderTargetHash'];

        expect(destroySpy).toHaveBeenCalledTimes(1);
        expect(renderer.renderTarget['_gpuRenderTargetHash'][rt.uid]).toBeNull();
        expect(hash.has(canvas)).toBe(false);
        expect(hash.has(rt.colorTexture)).toBe(false);
        expect(rt.colorTexture.source.destroyed).toBe(false);

        const fresh = renderer.renderTarget.getRenderTarget(canvas);

        expect(fresh.uid).not.toBe(rt.uid);

        destroySpy.mockRestore();
        renderer.destroy();
        canvas.remove();
    });

    itLocalOnly('is a safe no-op when called a second time', async () =>
    {
        const renderer = await getWebGPURenderer({});
        const { canvas } = await releaseScenario(renderer);

        expect(() => renderer.renderTarget.releaseRenderTarget(canvas)).not.toThrow();

        renderer.destroy();
        canvas.remove();
    });
});
