import { CompressedSource } from '../../../shared/texture/sources/CompressedSource';
import { getWebGLRenderer, loseAndRestoreContext } from '@test-utils';

import type { WebGLRenderer } from '../../WebGLRenderer';

const compressedExtension = /compressed_texture|texture_compression/;

describe('GlContextSystem', () =>
{
    let renderer: WebGLRenderer;
    let getExtension: jest.SpyInstance;

    const requestedExtensions = (): string[] => getExtension.mock.calls.map(([name]) => name);

    beforeEach(() =>
    {
        getExtension = jest.spyOn(WebGL2RenderingContext.prototype, 'getExtension');
    });

    afterEach(() =>
    {
        getExtension.mockRestore();
        renderer?.destroy();
        renderer = null;
    });

    it('should not enable compressed texture extensions at init', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });

        expect(requestedExtensions().filter((name) => compressedExtension.test(name))).toEqual([]);
    });

    it('should enable a compressed texture extension once, on first read', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });
        getExtension.mockClear();

        const astc = renderer.context.extensions.astc;

        expect(requestedExtensions()).toEqual(['WEBGL_compressed_texture_astc']);
        expect(renderer.context.extensions.astc).toBe(astc);
        expect(requestedExtensions()).toEqual(['WEBGL_compressed_texture_astc']);
        expect(Object.keys(renderer.context.extensions)).toContain('astc');
    });

    it('should enable the extension before uploading a compressed texture, also after a context restore', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });

        const gl = renderer.gl;
        const upload = () =>
        {
            const source = new CompressedSource({
                resource: [new Uint8Array(8)],
                format: 'bc1-rgba-unorm',
                width: 4,
                height: 4,
            });

            renderer.texture.initSource(source);

            return renderer.texture.getGlSource(source);
        };

        // the test runner supports s3tc; without it there is nothing to map
        if (!gl.getSupportedExtensions().includes('WEBGL_compressed_texture_s3tc')) return;

        gl.getError();

        expect(upload().internalFormat).toBe(renderer.context.extensions.s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT);
        expect(gl.getError()).toBe(gl.NO_ERROR);

        await loseAndRestoreContext(renderer);
        getExtension.mockClear();
        gl.getError();

        expect(upload().internalFormat).toBe(renderer.context.extensions.s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT);
        expect(requestedExtensions()).toContain('WEBGL_compressed_texture_s3tc');
        expect(gl.getError()).toBe(gl.NO_ERROR);
    });
});
