import { Resolver } from '../src/resolver/Resolver';
import { spriteSheetUrlParser } from '../src/utils/spriteSheetUrlParser';
import { textureUrlParser } from '../src/utils/textureUrlParser';
import { manifest } from './sampleManifest';

describe('Resolver', () =>
{
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

            resolver.add('test', [
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
            ]);

            const asset = resolver.resolveUrl('test');

            expect(asset).toBe(testData.expected);
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

        resolver.addUrlParser(textureUrlParser);

        resolver.add('test', [
            'profile-abel@0.5x.jpg',
            'profile-abel@2x.jpg',
            'profile-abel@0.5x.webp',
            'profile-abel@2x.webp',
        ]);

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

            resolver.add('test', [
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
            ]);

            resolver.prefer(testData.preferOrder);

            const asset = resolver.resolveUrl('test');

            expect(asset).toBe(testData.expected);
        });
    });

    it('should be able to have resolve to a different string', () =>
    {
        const resolver = new Resolver();

        resolver.add('test', 'hello');

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

        resolver.add(['test', 'test-2', 'test-3'], [{
            resolution: 2,
            format: 'png',
            src: 'my-image.png',
        }]);

        expect(resolver.resolveUrl('test')).toBe('my-image.png');
        expect(resolver.resolveUrl('test-2')).toBe('my-image.png');
        expect(resolver.resolveUrl('test-3')).toBe('my-image.png');
    });

    it('should set base path correctly on urls', () =>
    {
        const resolver = new Resolver();

        resolver.basePath = 'http://localhost:8080/';

        resolver.add('test', 'bunny.png');

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

        resolver.add('test', [{
            resolution: 2,
            format: 'png',
            src: 'my-image.png',
        }]);

        // TODO add default parser that just extracts file format
        resolver.add('explode-sound', [
            `explode.mp3`,
            `explode.ogg`,
        ]);

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

        resolver.add('test', [
            'my-image.webp',
            'my-image.png',
        ]);

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

        resolver.addUrlParser(textureUrlParser);

        resolver.add('test', [
            'my-image@4x.webp',
            'my-image@2x.webp',
            'my-image@2x.png',
            'my-image.png',
        ]);

        expect(resolver.resolveUrl('test')).toBe('my-image@2x.webp');
    });

    it('should resolve multiple assets', () =>
    {
        const resolver = new Resolver();

        resolver.add('test', 'out1.png');
        resolver.add('test2', 'out2.png');
        resolver.add('test3', 'out4.png');

        expect(resolver.resolve(['test', 'test2', 'test3'])).toEqual({
            test:  {
                alias: ['test'],
                format: 'png',
                src: 'out1.png',
            },
            test2:  {
                alias: ['test2'],
                format: 'png',
                src: 'out2.png',
            },
            test3:  {
                alias: ['test3'],
                format: 'png',
                src: 'out4.png',
            },
        });

        expect(resolver.resolveUrl(['test', 'test2', 'test3'])).toEqual({
            test: 'out1.png',
            test2:  'out2.png',
            test3:  'out4.png',
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

        resolver.add('test', [
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
        ]);

        expect(resolver.resolveUrl('test')).toBe('my-spritesheet@2x.webp.json');
    });

    it('should get multiple bundle ids correctly', () =>
    {
        const resolver = new Resolver();

        resolver.addManifest(manifest);

        const assets = resolver.resolveBundle(['default', 'level']);

        expect(assets.level).toEqual({
            image3: {
                alias: ['image3'],
                format: 'png',
                resolution: 1,
                src: 'chicken.png',
            },
        });

        expect(assets.default).toEqual({
            image1: {
                alias: ['image1'],
                format: 'png',
                resolution: 1,
                src: 'my-sprite@2x.png',
            },
            levelData: {
                alias:  [
                    'levelData',
                ],
                format: 'json',
                src: 'levelData.json',
            },
            spriteSheet1: {
                alias: ['spriteSheet1'],
                format: 'png',
                resolution: 1,
                src: 'my-sprite-sheet.json',
            },
            spriteSheet2: {
                alias: ['spriteSheet2'],
                format: 'png',
                resolution: 1,
                src: 'my-sprite-sheet-2.json',
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

    it('should parse a string sprite sheet correctly', () =>
    {
        [
            {
                url: 'my-sprite-sheet.json',
                pass: false,
            },
            {
                url: 'my-sprite-sheet@0.5x.webp.json',
                pass: true,
                result: {
                    format: 'webp',
                    resolution: 0.5,
                    src: 'my-sprite-sheet@0.5x.webp.json',
                },
            },
            {
                url: 'my-sprite-sheet@2x.png.json',
                pass: true,
                result: {
                    format: 'png',
                    resolution: 2,
                    src: 'my-sprite-sheet@2x.png.json',
                },
            },
            {
                url: 'my-sprite-sheet@2x.json',
                pass: false,
            },
        ].forEach((toTest) =>
        {
            const pass = spriteSheetUrlParser.test(toTest.url);

            expect(pass).toBe(toTest.pass);

            if (pass)
            {
                expect(spriteSheetUrlParser.parse(toTest.url)).toEqual(toTest.result);
            }
        });
    });

    it('should be able to have resolve with a single string with {} options', () =>
    {
        const resolver = new Resolver();

        resolver.add('test', 'my-image.{png, webp}');

        expect(resolver.resolveUrl('test')).toBe('my-image.png');

        resolver.reset();

        resolver.add('test', 'my-image.{png,webp}');

        resolver.prefer({
            params: {
                format: ['webp', 'png'],
            },
        });

        expect(resolver.resolveUrl('test')).toBe('my-image.webp');
    });
});
