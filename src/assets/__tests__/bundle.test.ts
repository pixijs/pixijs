import { setTimeout } from 'timers/promises';
import { Assets } from '../Assets';
import { basePath, getApp } from '@test-utils';
import { Texture } from '~/rendering';
import { Spritesheet } from '~/spritesheet';

import type { BundleIdentifierOptions } from '../resolver/Resolver';

describe('Assets bundles', () =>
{
    beforeAll(async () =>
    {
        // ensure app is loaded before running tests
        await getApp();
    });

    beforeEach(() =>
    {
        // reset the loader
        Assets.reset();
    });

    it('should add and load bundle', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.addBundle('testBundle', [
            { alias: 'bunny', src: 'textures/bunny.{png,webp}' },
            { alias: 'spritesheet', src: 'spritesheet/spritesheet.json' },
        ]);

        const assets = await Assets.loadBundle('testBundle');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);
    });

    it('should add and load bundle object', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.addBundle('testBundle', {
            bunny: 'textures/bunny.{png,webp}',
            spritesheet: 'spritesheet/spritesheet.json',
        });

        const assets = await Assets.loadBundle('testBundle');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);
    });

    it('should load a bundle found in the manifest', async () =>
    {
        await Assets.init({
            basePath,
            manifest: 'json/asset-manifest-2.json',
        });

        const assets = await Assets.loadBundle('default');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets['profile-abel']).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);
    });

    it('should load an object bundle found in the manifest', async () =>
    {
        await Assets.init({
            basePath,
            manifest: 'json/asset-manifest-object.json',
        });

        const assets = await Assets.loadBundle('default');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets['profile-abel']).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);
    });

    it('should load multiple bundles', async () =>
    {
        await Assets.init({
            basePath,
            manifest: 'json/asset-manifest-2.json',
        });

        const progressMock = jest.fn();

        const assets = await Assets.loadBundle(['default', 'data'], progressMock);

        expect(progressMock).toHaveBeenCalledTimes(4);
        expect(progressMock.mock.calls).toEqual([[0.25], [0.5], [0.75], [1]]);
        expect(assets.default.bunny).toBeInstanceOf(Texture);
        expect(assets.default['profile-abel']).toBeInstanceOf(Texture);
        expect(assets.default.spritesheet).toBeInstanceOf(Spritesheet);

        expect(assets.data[`test.json`]).toEqual({ testNumber: 23, testString: 'Test String 23' });
    });

    it('should background load bundles', async () =>
    {
        await Assets.init({
            basePath,
            manifest: 'json/asset-manifest-2.json',
        });

        await Assets.backgroundLoadBundle('default');

        await setTimeout(500);

        const expectTypes = {
            'json/asset-manifest-2.json': Object,
            'textures/bunny.png': Texture,
            'textures/profile-abel@2x.webp': Texture,
            'spritesheet/spritesheet.json': Spritesheet,
            'spritesheet/spritesheet.png': Texture,
        };

        for (const [key, type] of Object.entries(expectTypes))
        {
            const asset = await Assets.loader.promiseCache[basePath + key].promise;

            expect(asset).toBeInstanceOf(type);
        }
    });

    it('should unload bundles correctly', async () =>
    {
        await Assets.init({
            basePath,
        });

        Assets.addBundle('testBundle', [
            { alias: 'bunny', src: 'textures/bunny.{png,webp}' },
            { alias: 'spritesheet', src: 'spritesheet/spritesheet.json' },
        ]);

        const assets = await Assets.loadBundle('testBundle');

        expect(assets.bunny).toBeInstanceOf(Texture);
        expect(assets.spritesheet).toBeInstanceOf(Spritesheet);

        await Assets.unloadBundle('testBundle');

        expect(assets.bunny.baseTexture).toBe(null);
    });

    it('should load bundles with clashing names correctly', async () =>
    {
        const manifest = {
            bundles: [
                {
                    name: 'bunny1',
                    assets: [
                        {
                            alias: 'character',
                            src: 'textures/bunny.png',
                        },
                    ],
                },
                {
                    name: 'bunny2',
                    assets: [
                        {
                            alias: 'character',
                            src: 'textures/bunny-2.png',
                        },
                    ],
                },
            ]
        };

        await Assets.init({ manifest, basePath });

        const resources = await Assets.loadBundle('bunny1');
        const resources2 = await Assets.loadBundle('bunny2');

        expect(resources.character).not.toBe(resources2.character);
    });

    it('should load bundles with clashing names correctly with custom connector', async () =>
    {
        const manifest = {
            bundles: [
                {
                    name: 'bunny1',
                    assets: [
                        {
                            alias: ['character', 'character2'],
                            src: 'textures/bunny.png',
                        },
                    ],
                },
                {
                    name: 'bunny2',
                    assets: [
                        {
                            alias: ['character', 'character2'],
                            src: 'textures/bunny-2.png',
                        },
                    ],
                },
            ]
        };

        const bundleIdentifier: BundleIdentifierOptions = {
            connector: ':',
        };

        await Assets.init({ manifest, basePath, bundleIdentifier });

        const resources = await Assets.loadBundle('bunny1');
        const resources2 = await Assets.loadBundle('bunny2');

        expect(resources.character).not.toBe(resources2.character);

        const bunny2Character = await Assets.load('bunny2:character');

        expect(resources.character).not.toBe(bunny2Character.character);
        expect(resources2.character).not.toBe(bunny2Character.character);
    });

    it('should load bundles with clashing names correctly and overridden bundleIdentifier', async () =>
    {
        const manifest = {
            bundles: [
                {
                    name: 'bunny1',
                    assets: [
                        {
                            alias: 'character',
                            src: 'textures/bunny.png',
                        },
                    ],
                },
                {
                    name: 'bunny2',
                    assets: [
                        {
                            alias: 'character',
                            src: 'textures/bunny-2.png',
                        },
                    ],
                },
            ]
        };

        const bundleIdentifier: BundleIdentifierOptions = {
            createBundleAssetId: (bundleId, assetId) => `${assetId}>-<${bundleId}`,
            extractAssetIdFromBundle: (bundleId, assetId) => assetId.replace(`>-<${bundleId}`, ''),
        };

        await Assets.init({ manifest, basePath, bundleIdentifier });

        const resources = await Assets.loadBundle('bunny1');
        const resources2 = await Assets.loadBundle('bunny2');

        expect(resources.character).not.toBe(resources2.character);

        const bunny2Character = await Assets.load('character>-<bunny2');

        expect(resources.character).not.toBe(bunny2Character.character);
        expect(resources2.character).not.toBe(bunny2Character.character);
    });

    it('should throw an error if bundleIdentifier is overridden but does not pair up correctly', async () =>
    {
        const manifest = {
            bundles: [
                {
                    name: 'bunny1',
                    assets: [
                        {
                            alias: 'character',
                            src: 'textures/bunny.png',
                        },
                    ],
                },
                {
                    name: 'bunny2',
                    assets: [
                        {
                            alias: 'character',
                            src: 'textures/bunny-2.png',
                        },
                    ],
                },
            ]
        };

        const bundleIdentifier: BundleIdentifierOptions = {
            createBundleAssetId: (bundleId, assetId) => `${assetId}>-<${bundleId}`,
            extractAssetIdFromBundle: (_bundleId, _assetId) => 'no-idea',
        };

        // expect promise to throw an error..
        await expect(Assets.init({ manifest, basePath, bundleIdentifier })).rejects.toThrow();
    });

    it('should pass optional data correctly in a bundle', async () =>
    {
        const manifest = {
            bundles: [
                {
                    name: 'bunny1',
                    assets: [
                        {
                            alias: 'character',
                            src: 'textures/bunny.png',
                            data: {
                                otherData: 'thing'
                            }
                        },
                    ],

                },
            ]
        };

        await Assets.init({ manifest, basePath });

        // expect promise to throw an error..
        // eslint-disable-next-line jest/valid-expect
        expect(async () => await Assets.init({ manifest, basePath }));

        const bundle = Assets.resolver.resolveBundle('bunny1');

        expect(bundle.character.data).toEqual({ otherData: 'thing' });
    });
});
