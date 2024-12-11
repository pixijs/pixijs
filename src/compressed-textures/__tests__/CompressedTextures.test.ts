import { detectBasis } from '../basis/detectBasis';
import { loadDDS } from '../dds/loadDDS';
import { detectCompressed } from '../shared/detectCompressed';
import { resolveCompressedTextureUrl } from '../shared/resolveCompressedTextureUrl';
import { Assets, Loader, Resolver } from '~/assets';

import type { Texture } from '~/rendering';

describe('Compressed Loader', () =>
{
    beforeEach(() => Assets.reset());

    it('should load a a DDS image', async () =>
    {
        const loader = new Loader();

        loader['_parsers'].push(loadDDS);

        // eslint-disable-next-line max-len
        const texture = await loader.load<Texture>(`https://pixijs.io/compressed-textures-example/images/airplane-boeing_JPG_BC3_1.DDS`);

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
                format: ['bc3', 'bc2', 'png', 'webp'],
                resolution: 1
            }
        });

        resolver.add({
            alias: 'test', src: [
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
                    format: 'bc3',
                    src: 'my-image.bc3.ktx',
                },
            ]
        });

        const asset = resolver.resolveUrl('test');

        expect(asset).toEqual('my-image.bc3.ktx');
    });

    it('should resolve asset by name', () =>
    {
        const resolver = new Resolver();

        resolver['_parsers'].push(resolveCompressedTextureUrl);

        resolver.prefer({
            priority: ['format'],
            params: {
                format: ['bc3', 'astc', 'png', 'webp'],
                resolution: 1
            }
        });

        // ktx
        resolver.add({
            alias: 'ktx',
            src: ['my-image.png', 'my-image.webp', 'my-image.s3tc.ktx', 'my-image.astc.ktx', 'my-image.bc3.ktx']
        });
        const assetktx = resolver.resolveUrl('ktx');

        expect(assetktx).toEqual('my-image.bc3.ktx');

        // dds
        resolver.add({
            alias: 'dds',
            src: ['my-image.png', 'my-image.webp', 'my-image.s3tc.ktx', 'my-image.astc.dds', 'my-image.bc3.dds']
        });
        const assetdds = resolver.resolveUrl('dds');

        expect(assetdds).toEqual('my-image.bc3.dds');

        // ktx + dds
        resolver.add({
            alias: 'test',
            src: ['my-image.png', 'my-image.webp', 'my-image.s3tc.ktx', 'my-image.astc.ktx', 'my-image.bc3.dds']
        });
        const asset = resolver.resolveUrl('test');

        expect(asset).toEqual('my-image.bc3.dds');
    });

    it('should add compressed texture formats', async () =>
    {
        Assets['_detections'].push(detectCompressed);
        Assets['_detections'].push(detectBasis);
        await Assets.init();
        // eslint-disable-next-line jest/expect-expect
        expect((Assets.resolver['_preferredOrder'][0].params.format as string[]).includes('basis')).toBe(true);
        // eslint-disable-next-line jest/expect-expect
        expect((Assets.resolver['_preferredOrder'][0].params.format as string[]).includes('bc3')).toBe(true);
    });

    it('should remove any unsupported formats', async () =>
    {
        detectCompressed.test = jest.fn(async () => false);
        await Assets.init();
        // eslint-disable-next-line jest/expect-expect
        expect(Assets.resolver['_preferredOrder'][0].params.format.every(
            // eslint-disable-next-line jest/expect-expect
            (f: string) => !['bc3', 'bc2'].includes(f))).toBeTrue();
    });
});
