import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { getWebGLRenderer } from '@test-utils';

import type { WebGLRenderer } from '../../WebGLRenderer';

describe('GlTextureSystem', () =>
{
    let renderer: WebGLRenderer;

    afterEach(() =>
    {
        renderer?.destroy();
        renderer = null;
    });

    it('should upload a transparent pixel only for the shared empty texture', async () =>
    {
        renderer = await getWebGLRenderer();

        const gl = renderer.gl;
        const upload = jest.spyOn(gl, 'texImage2D');
        const source = new TextureSource({ width: 1, height: 1 });

        try
        {
            Texture.EMPTY.source.update();
            expect(gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL)).toBe(false);
            renderer.texture.initSource(source);

            expect(upload.mock.calls.map((args) => args[8])).toEqual([new Uint8Array(4), null]);
        }
        finally
        {
            upload.mockRestore();
            source.destroy();
        }
    });

    it('should count the mip levels of a 3D texture along its depth', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });

        const source = new TextureSource({ width: 2, height: 2, depth: 8, autoGenerateMipmaps: true });

        renderer.texture.initSource(source);

        expect(source.mipLevelCount).toBe(4);
    });

    it('should leave no GL error when creating or restyling a texture on WebGL1', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 1 });

        const gl = renderer.gl;

        expect(renderer.context.webGLVersion).toBe(1);

        // clear errors from renderer init so each assertion checks only its own step
        gl.getError();

        const source = new TextureSource({ width: 1, height: 1 });

        renderer.texture.initSource(source);

        expect(gl.getError()).toBe(gl.NO_ERROR);

        source.style.addressMode = 'repeat';
        source.style.update();

        expect(gl.getError()).toBe(gl.NO_ERROR);
    });
});
