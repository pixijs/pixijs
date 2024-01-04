import { Assets } from '@pixi/assets';
import { CompressedTextureResource, INTERNAL_FORMATS } from '@pixi/compressed-textures';
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

    it('should load BC7 DDS image', async () =>
    {
        await Assets.init({ basePath });

        // eslint-disable-next-line max-len
        const texture = await Assets.load<Texture>(`test-image-bc7-dds.dds`);

        expect(texture.baseTexture.valid).toBe(true);
        expect((texture.baseTexture.resource as CompressedTextureResource).format)
            .toBe(INTERNAL_FORMATS.COMPRESSED_RGBA_BPTC_UNORM_EXT);
        expect(texture.width).toBe(512);
        expect(texture.height).toBe(512);
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
            (f: string) => !['s3tc', 's3tc_sRGB', 'etc', 'etc1', 'pvrtc', 'atc', 'astc', 'bptc'].includes(f))).toBeTrue();
    });

    it('should resolve extension by format', async () =>
    {
        const extensions: { [key: string]: number[] } = {
            s3tc: [INTERNAL_FORMATS.COMPRESSED_RGB_S3TC_DXT1_EXT, INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT,
                INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT, INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT],
            // eslint-disable-next-line camelcase
            s3tc_sRGB: [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT,
                INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT,
                INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT,
                INTERNAL_FORMATS.COMPRESSED_SRGB_S3TC_DXT1_EXT],
            etc: [INTERNAL_FORMATS.COMPRESSED_R11_EAC, INTERNAL_FORMATS.COMPRESSED_SIGNED_R11_EAC,
                INTERNAL_FORMATS.COMPRESSED_RG11_EAC, INTERNAL_FORMATS.COMPRESSED_SIGNED_RG11_EAC,
                INTERNAL_FORMATS.COMPRESSED_RGB8_ETC2, INTERNAL_FORMATS.COMPRESSED_RGBA8_ETC2_EAC,
                INTERNAL_FORMATS.COMPRESSED_SRGB8_ETC2, INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC,
                INTERNAL_FORMATS.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2,
                INTERNAL_FORMATS.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2],
            etc1: [INTERNAL_FORMATS.COMPRESSED_RGB_ETC1_WEBGL],
            pvrtc: [INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_4BPPV1_IMG, INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
                INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_2BPPV1_IMG, INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG],
            atc: [INTERNAL_FORMATS.COMPRESSED_RGB_ATC_WEBGL, INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL,
                INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL],
            astc: [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_4x4_KHR],
            bptc: [INTERNAL_FORMATS.COMPRESSED_RGBA_BPTC_UNORM_EXT, INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT,
                INTERNAL_FORMATS.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT,
                INTERNAL_FORMATS.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT]
        };

        // Validate all INTERNAL_FORMATS are mapped to extensions
        Object.values(INTERNAL_FORMATS)
            .filter((v) => !isNaN(Number(v)))
            .map((value) => Number(value))
            .forEach((value) =>
            {
                let found = false;

                for (const ext in extensions)
                {
                    if (extensions[ext].includes(value))
                    {
                        found = true;
                        break;
                    }
                }
                expect(found).toBeTrue();
            });

        // test CompressedTextureResource._formatToExtension
        for (const ext in extensions)
        {
            for (const format of extensions[ext])
            {
                const texture = new CompressedTextureResource(null, {
                    height: 1, width: 1,
                    format
                });

                expect(texture['_extension']).toBe(ext);
            }
        }
    });
});
