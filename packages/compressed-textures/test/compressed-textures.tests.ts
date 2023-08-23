import { Assets } from '@pixi/assets';
import { Loader } from '../../assets/src/loader/Loader';
import { Resolver } from '../../assets/src/resolver/Resolver';
import { detectCompressedTextures, loadDDS, loadKTX, resolveCompressedTextureUrl } from '../src/loaders';

import type { Texture } from '@pixi/core';

describe('Compressed Loader', () =>
{
    const basePath = process.env.GITHUB_ACTIONS
        // eslint-disable-next-line max-len
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/packages/compressed-textures/test/assets/`
        : 'http://localhost:8080/compressed-textures/test/assets/';

    beforeEach(() => Assets.reset());

    it('should load a ktx image', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadKTX);

        // eslint-disable-next-line max-len
        const texture = await loader.load<Texture>(`https://pixijs.io/compressed-textures-example/images/PixiJS-Logo_PNG_BC3_KTX.KTX`);

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(898);
        expect(texture.height).toBe(227);
    });

    it('should load an uncompressed ktx image', async () =>
    {
        await Assets.init({ basePath });

        // eslint-disable-next-line max-len
        const texture = await Assets.load<Texture>(`test-image-ktx.ktx`);

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(128);
        expect(texture.height).toBe(128);
    });

    it('should load a a DDS image', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadDDS);

        // eslint-disable-next-line max-len
        const texture = await loader.load<Texture>(`https://pixijs.io/compressed-textures-example/images/airplane-boeing_JPG_BC3_1.DDS`);

        expect(texture.baseTexture.valid).toBe(true);
        expect(texture.width).toBe(1000);
        expect(texture.height).toBe(664);
    });

    it('should resolve asset', () =>
    {
        const resolver = new Resolver();

        resolver['_parsers'].push(resolveCompressedTextureUrl);

        resolver.prefer({
            priority: ['format'],
            params: {
                format: ['s3tc', 's3tc_sRGB', 'png', 'webp'],
                resolution: 1
            }
        });

        resolver.add('test', [
            {
                resolution: 1,
                format: 'png',
                src: 'my-image.png',
            },
            {
                resolution: 1,
                format: 'webp',
                src: 'my-image.webp',
            },
            {
                resolution: 1,
                format: 's3tc',
                src: 'my-image.s3tc.ktx',
            },
        ]);

        const asset = resolver.resolveUrl('test');

        expect(asset).toEqual('my-image.s3tc.ktx');
    });

    it('should add compressed texture formats', async () =>
    {
        await Assets.init();
        expect((Assets.resolver['_preferredOrder'][0].params.format as string[]).includes('s3tc')).toBe(true);
    });

    it('should remove any unsupported formats', async () =>
    {
        detectCompressedTextures.test = jest.fn(async () => false);
        await Assets.init();
        expect(Assets.resolver['_preferredOrder'][0].params.format.every(
            (f: string) => !['s3tc', 's3tc_sRGB', 'etc', 'etc1', 'pvrtc', 'atc', 'astc'].includes(f))).toBeTrue();
    });
});
