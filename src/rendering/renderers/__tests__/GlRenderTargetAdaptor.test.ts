import { RenderTarget } from '../shared/renderTarget/RenderTarget';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { getWebGLRenderer } from '@test-utils';

import type { WebGLRenderer } from '../gl/WebGLRenderer';

describe('GlRenderTargetAdaptor', () =>
{
    let renderer: WebGLRenderer;

    afterEach(() =>
    {
        renderer?.destroy();
        renderer = null;
    });

    it('should make a repeat destroyGpuRenderTarget a no-op', async () =>
    {
        renderer = await getWebGLRenderer({});

        const renderTarget = new RenderTarget({
            colorTextures: [new TextureSource({ width: 64, height: 64, antialias: true })],
            stencil: true,
        });

        renderer.renderTarget.bind({ target: renderTarget });
        renderer.renderTarget.finishRenderPass();

        const gpuRenderTarget = renderer.renderTarget.getGpuRenderTarget(renderTarget);

        // every delete branch needs something to free: the msaa view and resolve framebuffers,
        // one msaa colour renderbuffer and the depth-stencil renderbuffer
        expect(gpuRenderTarget.msaa).toBe(true);
        expect(gpuRenderTarget.msaaRenderBuffer).toHaveLength(1);
        expect(gpuRenderTarget.depthStencilRenderBuffer).toBeTruthy();

        const deleteFramebuffer = jest.spyOn(renderer.gl, 'deleteFramebuffer');
        const deleteRenderbuffer = jest.spyOn(renderer.gl, 'deleteRenderbuffer');
        const { adaptor } = renderer.renderTarget;

        adaptor.destroyGpuRenderTarget(gpuRenderTarget);

        expect(deleteFramebuffer).toHaveBeenCalledTimes(2);
        expect(deleteRenderbuffer).toHaveBeenCalledTimes(2);

        expect(() => adaptor.destroyGpuRenderTarget(gpuRenderTarget)).not.toThrow();

        expect(deleteFramebuffer).toHaveBeenCalledTimes(2);
        expect(deleteRenderbuffer).toHaveBeenCalledTimes(2);
        expect(gpuRenderTarget.framebuffer).toBeNull();
        expect(gpuRenderTarget.resolveTargetFramebuffer).toBeNull();
        expect(gpuRenderTarget.depthStencilRenderBuffer).toBeNull();
        expect(gpuRenderTarget.msaaRenderBuffer).toEqual([]);
    });
});
