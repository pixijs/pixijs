import { getTexture, getWebGLRenderer } from '@test-utils';

import type { WebGLRenderer } from '~/rendering';

describe('GLTextureSystem', () =>
{
    it('should generate canvas from texture', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const texture = getTexture({ width: 10, height: 10 });
        const canvas = renderer.texture.generateCanvas(texture);

        expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        expect(canvas.width).toBe(texture.width);
        expect(canvas.height).toBe(texture.height);
    });

    it('should get pixels from texture', async () =>
    {
        const renderer = (await getWebGLRenderer()) as WebGLRenderer;
        const texture = getTexture({ width: 10, height: 10 });
        const pixelInfo = renderer.texture.getPixels(texture);

        expect(pixelInfo.pixels).toHaveLength(texture.width * texture.height * 4);
        expect(pixelInfo.width).toBe(texture.width);
        expect(pixelInfo.height).toBe(texture.height);
    });

    it('should reset premultiply alpha state when resetState is called', async () =>
    {
        const renderer = await getWebGLRenderer({}) as WebGLRenderer;

        const gl = renderer.gl;

        // Force internal state to true (different from default)
        renderer.texture['_premultiplyAlpha'] = true;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        // Call reset state
        renderer.texture.resetState();

        // Verify internal state was reset
        expect(renderer.texture['_premultiplyAlpha']).toBe(false);

        expect(gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL)).toBe(false);
    });
});
