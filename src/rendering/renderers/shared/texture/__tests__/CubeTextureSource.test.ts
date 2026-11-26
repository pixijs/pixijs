import { CubeTexture } from '../CubeTexture';
import { CubeTextureSource } from '../sources/CubeTextureSource';

describe('CubeTextureSource', () =>
{
    it('should create an empty cube from width, height and format when no faces are given', () =>
    {
        const source = new CubeTextureSource({ width: 64, height: 64, resolution: 2, format: 'rgba16float' });

        expect(source.viewDimension).toBe('cube');
        expect(source.arrayLayerCount).toBe(6);
        expect(source.pixelWidth).toBe(128);
        expect(source.format).toBe('rgba16float');
        expect(source.faces).toBeUndefined();
        // nothing to upload: allocated empty, like a RenderTexture
        expect(source.uploadMethodId).toBe('unknown');
        expect(new CubeTexture({ source }).source).toBe(source);
    });
});
