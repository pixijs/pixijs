import { TextureSource } from '../../../shared/texture/sources/TextureSource';
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

    it('should count the mip levels of a 3D texture along its depth', async () =>
    {
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });

        const source = new TextureSource({ width: 2, height: 2, depth: 8, autoGenerateMipmaps: true });

        renderer.texture.initSource(source);

        expect(source.mipLevelCount).toBe(4);
    });
});
