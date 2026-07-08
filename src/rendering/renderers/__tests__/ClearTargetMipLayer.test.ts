import { getWebGLRenderer } from '@test-utils';
import { CanvasSource } from '~/rendering';

describe('RenderTargetSystem.clear mip/layer defaults', () =>
{
    it('clears a canvas target after a higher layer was left bound, without throwing', async () =>
    {
        const renderer = await getWebGLRenderer({ width: 16, height: 16, multiView: true });

        // the canvas colorTexture is a CanvasSource with arrayLayerCount === 1, so binding it
        // at any layer > 0 is out of bounds
        const canvasSource = renderer.renderTarget.getRenderTarget(renderer.canvas).colorTexture;

        expect(canvasSource).toBeInstanceOf(CanvasSource);
        expect(canvasSource.arrayLayerCount).toBe(1);

        // simulate the binding state a prior array-texture render leaves behind: a non-zero layer
        renderer.renderTarget['layer'] = 3;

        // clear with NO explicit mip/layer. Before the fix, clear defaulted mipLevel/layer to the
        // leftover this.mipLevel/this.layer (3), so binding the canvas threw
        // "[RenderTargetSystem] layer 3 is out of bounds". With the fix it defaults to layer 0.
        expect(() => renderer.renderTarget.clear(canvasSource)).not.toThrow();

        renderer.destroy();
    });
});
