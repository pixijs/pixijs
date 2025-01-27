import { Assets } from '../../Assets';
import { resolveJsonUrl } from '../parsers/resolveJsonUrl';
import { resolveTextureUrl } from '../parsers/resolveTextureUrl';
import { getUrlExtension, Resolver } from '../Resolver';
import { manifest } from './sampleManifest';
import { extensions, ExtensionType } from '~/extensions';
import { spritesheetAsset } from '~/spritesheet';

import type { FormatDetectionParser } from '../../detections/types';

const testDetector = {
    extension: {
        type: ExtensionType.DetectionParser,
        priority: 2,
    },
    test: async (): Promise<boolean> =>
        true,
    add: async (formats: string[]): Promise<string[]> =>
        ['best', 'ok', 'worst', ...formats],

} as FormatDetectionParser;

describe('Resolver', () =>
{
    beforeEach(() =>
    {
        // reset the loader
        Assets.reset();
    });

    it('should load correct preferred asset', async () =>
    {
        extensions.add(testDetector);

        await Assets.init();

        Assets.resolver.add({
            alias: 'test',
            src: [
                'src.worst',
                'src.ok',
                'src.best',
            ]
        });

        const resolvedAsset = Assets.resolver.resolve('test');

        expect(resolvedAsset.src).toBe('src.best');
    });

    it('should parse using the spritesheet parser', async () =>
    {
        extensions.add(spritesheetAsset, resolveJsonUrl);

        await Assets.init();

        Assets.resolver.add({
            alias: 'test',
            src: [
                'src@2x.webp.json',
                'src@2x.png.json',
            ]
        });

        const resolvedAsset = Assets.resolver.resolve('test');

        expect(resolvedAsset.src).toBe('src@2x.webp.json');
    });

    it('should resolve asset', () =>
    {
        const resolver = new Resolver();

        [
            {
                preferOrder: {
                    priority: ['resolution', 'format'],
                    params: {
                        format: ['png', 'webp'],
                        resolution: [2, 1],
                    },
                },
                expected: 'my-image@2x.png',
            },
            {
                preferOrder: {
                    params: {
                        resolution: [1],
                        format: ['png', 'webp'],
                    },
                    priority: ['resolution', 'format'],
                },
                expected: 'my-image.png',
            },
            {
                preferOrder: {
                    params: {
                        resolution: [1],
                        format: ['webp', 'png'],
                    },
                    priority: ['resolution', 'format'],
                },
                expected: 'my-image.webp',
            },
            {
                preferOrder: {
                    params: {
                        resolution: [2, 1],
                        format: ['webp', 'png'],
                    },
                    priority: ['format', 'resolution'],
                },
                expected: 'my-image.webp',
            },
            {
                preferOrder: {
                    params: {
                        resolution: [2, 1],
                        format: ['webp', 'png'],
                    },
                    priority: ['resolution', 'format'],
                },
                expected: 'my-image@2x.png',
            },

        ].forEach((testData, i) =>
        {
            if (i !== 0) return;

            resolver.reset();

            resolver.prefer(testData.preferOrder);
            resolver.add({
                alias: 'test-src',
                src: [
                    {
                        resolution: 1,
                        format: 'png',
                        src: 'my-image.png',
                    },
                    {
                        resolution: 2,
                        format: 'png',
                        src: 'my-image@2x.png',
                    },
                    {
                        resolution: 1,
                        format: 'webp',
                        src: 'my-image.webp',
                    },
                ]
            });

            resolver.add({
                alias: 'test-obj',
                src: [
                    {
                        resolution: 1,
                        format: 'png',
                        src: 'my-image.png',
                    },
                    {
                        resolution: 2,
                        format: 'png',
                        src: 'my-image@2x.png',
                    },
                    {
                        resolution: 1,
                        format: 'webp',
                        src: 'my-image.webp',
                    },
                ]
            });

            const asset = resolver.resolveUrl('test-src');
            const asset2 = resolver.resolveUrl('test-obj');

            expect(asset).toBe(testData.expected);
            expect(asset2).toBe(testData.expected);
        });
    });

    it('should resolve the correct texture', () =>
    {
        const resolver = new Resolver();

        resolver.prefer({
            priority: ['resolution', 'format'],
            params: {
                format: ['jpg'],
                resolution: [2],
            },
        });

        resolver['_parsers'].push(resolveTextureUrl);

        resolver.add({
            alias: 'test',
            src: [
                'profile-abel@0.5x.jpg',
                'profile-abel@2x.jpg',
                'profile-abel@0.5x.webp',
                'profile-abel@2x.webp',
            ],
        });

        resolver.add({
            alias: 'test-obj',
            src: [
                'profile-abel@0.5x.jpg',
                'profile-abel@2x.jpg',
                'profile-abel@0.5x.webp',
                'profile-abel@2x.webp',
            ]
        });

        resolver.add({
            alias: 'test-string-obj',
            src: 'profile-abel@{0.5,2}x.{jpg,webp}',
        });

        resolver.add({
            alias: 'test-string-glob-obj',
            src: 'profile-abel@{0.5,2}x.{jpg,webp}',
        });

        resolver.add({
            alias: 'test-string',
            src: 'profile-abel@{0.5,2}x.{jpg,webp}',
        });

        resolver.add({
            alias: 'test-glob-string',
            src: 'profile-abel@{0.5,2}x.{jpg,webp}',
        });

        expect(resolver.resolveUrl('test')).toBe('profile-abel@2x.jpg');
        expect(resolver.resolveUrl('test-obj')).toBe('profile-abel@2x.jpg');
        expect(resolver.resolveUrl('test-string-obj')).toBe('profile-abel@2x.jpg');
        expect(resolver.resolveUrl('test-string-glob-obj')).toBe('profile-abel@2x.jpg');
        expect(resolver.resolveUrl('test-string')).toBe('profile-abel@2x.jpg');
        expect(resolver.resolveUrl('test-glob-string')).toBe('profile-abel@2x.jpg');
    });

    it('should resolve the correct texture using an object', () =>
    {
        const resolver = new Resolver();

        resolver.prefer({
            priority: ['resolution', 'format'],
            params: {
                format: ['jpg'],
                resolution: [2],
            },
        });

        resolver['_parsers'].push(resolveTextureUrl);

        resolver.add({
            alias: 'test',
            src: [
                'profile-abel@0.5x.jpg',
                'profile-abel@2x.jpg',
                'profile-abel@0.5x.webp',
                'profile-abel@2x.webp',
            ]
        });

        expect(resolver.resolveUrl('test')).toBe('profile-abel@2x.jpg');
    });

    it('should resolve asset without priority', () =>
    {
        const resolver = new Resolver();

        [
            {
                preferOrder: {
                    params: {
                        resolution: [2],
                        format: ['webp', 'png'],
                    },
                },
                expected: 'my-image@2x.png',
            },
            {
                preferOrder: {
                    params: {
                        format: ['webp', 'png'],
                        resolution: [2],
                    },
                },
                expected: 'my-image.webp',
            },
        ].forEach((testData) =>
        {
            resolver.reset();

            resolver.add({
                alias: 'test',
                src: [
                    {
                        resolution: 1,
                        format: 'png',
                        src: 'my-image.png',
                    },
                    {
                        resolution: 2,
                        format: 'png',
                        src: 'my-image@2x.png',
                    },
                    {
                        resolution: 1,
                        format: 'webp',
                        src: 'my-image.webp',
                    },
                ]
            });

            resolver.prefer(testData.preferOrder);

            const asset = resolver.resolveUrl('test');

            expect(asset).toBe(testData.expected);
        });
    });

    it('should be able to have resolve to a different string', () =>
    {
        const resolver = new Resolver();

        resolver.add({ alias: 'test', src: 'hello' });

        expect(resolver.resolveUrl('test')).toBe('hello');
    });

    it('should be able to have multiple aliases', () =>
    {
        const resolver = new Resolver();

        resolver.prefer({
            params: {
                resolution: [2, 1],
                format: ['webp', 'png'],
            },
            priority: ['resolution', 'format'],
        });

        resolver.add({
            alias: ['test', 'test-2', 'test-3'],
            src: [
                {
                    resolution: 2,
                    format: 'png',
                    src: 'my-image.png',
                }],
        });

        expect(resolver.resolveUrl('test')).toBe('my-image.png');
        expect(resolver.resolveUrl('test-2')).toBe('my-image.png');
        expect(resolver.resolveUrl('test-3')).toBe('my-image.png');
    });

    it('should set base path correctly on urls', () =>
    {
        const resolver = new Resolver();

        resolver.basePath = 'http://localhost:8080/';

        resolver.add({ alias: 'test', src: 'bunny.png' });

        expect(resolver.resolveUrl('test')).toBe('http://localhost:8080/bunny.png');
    });

    it('should be able to have multiple preferences', () =>
    {
        const resolver = new Resolver();

        // check the params when adding!
        resolver.prefer({
            params: {
                format: ['ogg', 'mp3'],
            },
        });

        resolver.prefer({
            params: {
                format: ['webp', 'png'],
                resolution: [2, 1],
            },
        });

        resolver.add({
            alias: 'test',
            src: [{
                resolution: 2,
                format: 'png',
                src: 'my-image.png',
            }]
        });

        // TODO add default parser that just extracts file format
        resolver.add({
            alias: 'explode-sound', src: [
                `explode.mp3`,
                `explode.ogg`,
            ]
        });

        expect(resolver.resolveUrl('test')).toBe('my-image.png');
        expect(resolver.resolveUrl('explode-sound')).toBe('explode.ogg');
    });

    it('should be able to parse strings', () =>
    {
        const resolver = new Resolver();

        resolver.prefer({
            priority: ['format'],
            params: {
                format: ['png', 'webp'],
            },
        });

        resolver.add({
            alias: 'test', src: [
                'my-image.webp',
                'my-image.png',
            ]
        });

        expect(resolver.resolveUrl('test')).toBe('my-image.png');
    });

    it('should be able to parse strings in a custom way', () =>
    {
        const resolver = new Resolver();

        resolver.prefer({
            priority: ['resolution', 'format'],
            params: {
                resolution: [2, 1],
                format: ['webp', 'png'],
            },
        });

        resolver['_parsers'].push(resolveTextureUrl);

        resolver.add({
            alias: 'test', src: [
                'my-image@4x.webp',
                'my-image@2x.webp',
                'my-image@2x.png',
                'my-image.png',
            ]
        });

        expect(resolver.resolveUrl('test')).toBe('my-image@2x.webp');
    });

    it('should resolve multiple assets', () =>
    {
        const resolver = new Resolver();

        resolver.add({ alias: 'test', src: 'out1.png' });
        resolver.add({ alias: 'test2', src: 'out2.png' });
        resolver.add({ alias: 'test3', src: 'out4.png' });

        expect(resolver.resolve(['test', 'test2', 'test3'])).toEqual({
            test: {
                alias: ['test'],
                src: 'out1.png',
                format: 'png',
                loadParser: undefined,
                data: {}
            },
            test2: {
                alias: ['test2'],
                src: 'out2.png',
                format: 'png',
                loadParser: undefined,
                data: {}
            },
            test3: {
                alias: ['test3'],
                src: 'out4.png',
                format: 'png',
                loadParser: undefined,
                data: {}
            },
        });

        expect(resolver.resolveUrl(['test', 'test2', 'test3'])).toEqual({
            test: 'out1.png',
            test2: 'out2.png',
            test3: 'out4.png',
        });
    });

    it('should find the preferred order if partial preference is set', () =>
    {
        const resolver = new Resolver();

        resolver.prefer({
            params: {
                format: ['webm'],
                resolution: [1, 0.75],
            },
        });

        resolver.add({
            alias: 'test3',
            src: ['out3.m4v', 'out3.webm', 'out3.mp4'],
        });

        expect(resolver.resolve(['test3'])).toEqual({
            test3: {
                alias: ['test3'],
                src: 'out3.webm',
                format: 'webm',
                loadParser: undefined,
                data: {}
            },
        });

        expect(resolver.resolveUrl(['test3'])).toEqual({
            test3: 'out3.webm',
        });
    });

    it('should resolve a bundle id correctly', () =>
    {
        const resolver = new Resolver();

        resolver.prefer({
            params: {
                resolution: [2, 1],
                format: ['webp', 'png'],
            },
        });

        resolver.add({
            alias: 'test', src: [
                {
                    resolution: 2,
                    format: 'webp',
                    src: 'my-spritesheet@2x.webp.json',
                },
                {
                    resolution: 0.5,
                    format: 'webp',
                    src: 'my-spritesheet@0.5x.webp.json',
                },
                {
                    resolution: 2,
                    format: 'png',
                    src: 'my-spritesheet@2x.png.json',
                },
                {
                    resolution: 0.5,
                    format: 'png',
                    src: 'my-spritesheet@0.5x.png.json',
                },
            ]
        });

        expect(resolver.resolveUrl('test')).toBe('my-spritesheet@2x.webp.json');
    });

    it('should get multiple bundle ids correctly', () =>
    {
        const resolver = new Resolver();

        resolver.addManifest(manifest);

        const assets = resolver.resolveBundle(['default', 'level']);

        expect(assets.level).toEqual({
            image3: {
                alias: ['image3', 'level-image3'],
                src: 'chicken.png',
                format: 'png',
                resolution: 1,
                loadParser: undefined,
                data: {}
            },
        });

        expect(assets.default).toEqual({
            image1: {
                alias: ['image1', 'default-image1'],
                format: 'png',
                resolution: 1,
                src: 'my-sprite@2x.png',
                loadParser: undefined,
                data: {}
            },
            levelData: {
                alias: [
                    'levelData',
                    'default-levelData',
                ],
                format: 'json',
                src: 'levelData.json',
                loadParser: undefined,
                data: {}
            },
            spriteSheet1: {
                alias: ['spriteSheet1', 'default-spriteSheet1'],
                format: 'png',
                resolution: 1,
                src: 'my-sprite-sheet.json',
                loadParser: undefined,
                data: {}
            },
            spriteSheet2: {
                alias: ['spriteSheet2', 'default-spriteSheet2'],
                format: 'png',
                resolution: 1,
                src: 'my-sprite-sheet-2.json',
                loadParser: undefined,
                data: {}
            },
        });
    });

    it('should resolve a bundle correctly', () =>
    {
        const resolver = new Resolver();

        resolver.addManifest(manifest);

        const assets = resolver.resolveUrl(['image1', 'levelData', 'spriteSheet1', 'spriteSheet2']);

        expect(assets).toEqual({
            image1: 'my-sprite@2x.png',
            levelData: 'levelData.json',
            spriteSheet1: 'my-sprite-sheet.json',
            spriteSheet2: 'my-sprite-sheet-2.json',
        });
    });

    it('should be able to have resolve with a single string with {} options', () =>
    {
        const resolver = new Resolver();

        resolver.add({ alias: 'test', src: 'my-image.{png, webp}' });

        expect(resolver.resolveUrl('test')).toBe('my-image.png');

        resolver.reset();

        resolver.add({ alias: 'test', src: 'my-image.{png,webp}' });

        resolver.prefer({
            params: {
                format: ['webp', 'png'],
            },
        });

        expect(resolver.resolveUrl('test')).toBe('my-image.webp');
    });

    it('should be able to append a default url params object correctly', () =>
    {
        const resolver = new Resolver();

        resolver.setDefaultSearchParams({
            hello: 'world',
            lucky: 23,
        });

        resolver.add({ alias: 'test', src: 'my-image.png' });

        expect(resolver.resolveUrl('test')).toBe('my-image.png?hello=world&lucky=23');
    });

    it('should be able to append a default url params string correctly', () =>
    {
        const resolver = new Resolver();

        resolver.setDefaultSearchParams('hello=world&lucky=23');

        resolver.add({ alias: 'test', src: 'my-image.png' });

        expect(resolver.resolveUrl('test')).toBe('my-image.png?hello=world&lucky=23');
    });

    it('should be able to append default url params correctly even if the url already has some', () =>
    {
        const resolver = new Resolver();

        resolver.setDefaultSearchParams('hello=world&lucky=23');

        resolver.add({ alias: 'test', src: 'my-image.png?chicken=egg' });

        expect(resolver.resolveUrl('test')).toBe('my-image.png?chicken=egg&hello=world&lucky=23');
    });

    it('should be able to append default url params correctly even if the url has no key', () =>
    {
        const resolver = new Resolver();

        resolver.setDefaultSearchParams('hello=world&lucky=23');

        expect(resolver.resolveUrl('my-image.png')).toBe('my-image.png?hello=world&lucky=23');
    });

    it('should parse url extensions correctly', () =>
    {
        expect(getUrlExtension('http://example.com/bunny.webp')).toBe('webp');
        expect(getUrlExtension('http://example.com/bunny.webp?abc=123&efg=456')).toBe('webp');
        expect(getUrlExtension('http://example.com/bunny.webp?abc#hash')).toBe('webp');
    });

    it('should be able to resolve format with query parameters', () =>
    {
        const resolver = new Resolver();

        resolver.prefer({
            params: {
                format: ['webp', 'png'],
            },
        });

        resolver.add({ alias: 'bunny', src: 'http://example.com/bunny.{png,webp}' });
        resolver.add({ alias: 'bunny2', src: 'http://example.com/bunny.{png,webp}?abc' });

        expect(resolver.resolveUrl('bunny')).toBe('http://example.com/bunny.webp');
        expect(resolver.resolveUrl('bunny2')).toBe('http://example.com/bunny.webp?abc');
    });
});
