import { getAdjustedBlendModeBlend } from '../getAdjustedBlendModeBlend';

import type { TextureSource } from '../../texture/sources/TextureSource';

describe('getAdjustedBlendModeBlend', () =>
{
    it('should return blendMode unchanged when textureSource is null', () =>
    {
        const result = getAdjustedBlendModeBlend('normal', null as unknown as TextureSource);

        expect(result).toBe('normal');
    });

    it('should return NPM blend mode when alphaMode is no-premultiply-alpha', () =>
    {
        const textureSource = { alphaMode: 'no-premultiply-alpha' } as TextureSource;
        const result = getAdjustedBlendModeBlend('normal', textureSource);

        expect(result).toBe('normal-npm');
    });

    it('should return original blendMode when alphaMode is premultiplied', () =>
    {
        const textureSource = { alphaMode: 'premultiply-alpha-on-upload' } as TextureSource;
        const result = getAdjustedBlendModeBlend('add', textureSource);

        expect(result).toBe('add');
    });
});
