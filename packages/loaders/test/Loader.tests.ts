import { Loader } from '@pixi/loaders';
import { Texture, ImageResource, SVGResource } from '@pixi/core';
import { TextureCache } from '@pixi/utils';
import { SCALE_MODES } from '@pixi/constants';
import { createServer } from './resources';

import type { Server } from 'http';

const createRandomName = () => `image${(Math.random() * 10000) | 0}`;

describe('Loader', () =>
{
    let server: Server;
    let baseUrl: string;

    beforeAll(() =>
    {
        server = createServer(8125);
        baseUrl = 'http://localhost:8125';
    });

    afterAll(() =>
    {
        server.close();
        server = null;
        baseUrl = null;
    });

    it('should exist', () =>
    {
        expect(Loader).toBeInstanceOf(Function);
    });

    it('should have shared loader', () =>
    {
        expect(Loader.shared).toBeDefined();
        expect(Loader.shared).toBeInstanceOf(Loader);
    });

    it('should basic load an image using the TextureLoader', (done) =>
    {
        const loader = new Loader();
        const name = createRandomName();
        const url = `${baseUrl}/bunny.png`;

        loader.add(name, url);
        loader.load((ldr, resources) =>
        {
            expect(ldr).toEqual(loader);
            expect(name in resources).toBeTruthy();

            const texture = resources[name].texture as Texture<ImageResource>;

            expect(texture).toBeInstanceOf(Texture);
            expect(texture.baseTexture.valid).toBe(true);
            expect(texture.baseTexture.resource).toBeInstanceOf(ImageResource);
            expect(texture.baseTexture.resource.url).toEqual(url);
            expect(TextureCache[name]).toEqual(texture);
            expect(TextureCache[url]).toEqual(texture);
            loader.reset();
            texture.destroy(true);
            expect(loader.resources[name]).toBeUndefined();
            expect(TextureCache[name]).toBeUndefined();
            expect(TextureCache[url]).toBeUndefined();
            done();
        });
    });

    it('should basic load an SVG using the TextureLoader', (done) =>
    {
        const loader = new Loader();
        const name = createRandomName();
        const url = `${baseUrl}/logo.svg`;

        loader.add(name, url);
        loader.load(() =>
        {
            const { texture, data } = loader.resources[name];
            const { baseTexture } = texture;

            expect(typeof data).toEqual('string');
            expect(baseTexture.resource).toBeInstanceOf(SVGResource);
            expect(baseTexture.valid).toBe(true);
            expect(baseTexture.width).toEqual(512);
            expect(baseTexture.height).toEqual(512);
            loader.reset();
            texture.destroy(true);
            done();
        });
    });

    it('should allow setting baseTexture properties through metadata', (done) =>
    {
        const loader = new Loader();
        const name = createRandomName();
        const options = {
            metadata: {
                scaleMode: SCALE_MODES.NEAREST,
                resolution: 2,
            },
        };

        loader.add(name, `${baseUrl}/bunny.png`, options).load(() =>
        {
            const { texture } = loader.resources[name];
            const { scaleMode, resolution } = texture.baseTexture;

            expect(scaleMode).toEqual(SCALE_MODES.NEAREST);
            expect(resolution).toEqual(2);
            loader.reset();
            texture.destroy(true);
            done();
        });
    });

    it('should allow setting SVG width/height through metadata', (done) =>
    {
        const loader = new Loader();
        const name = createRandomName();
        const options = {
            metadata: {
                resourceOptions: {
                    width: 128,
                    height: 256,
                },
            },
        };

        loader.add(name, `${baseUrl}/logo.svg`, options).load(() =>
        {
            const { texture } = loader.resources[name];
            const { width, height } = texture.baseTexture;

            expect(width).toEqual(128);
            expect(height).toEqual(256);
            loader.reset();
            texture.destroy(true);
            done();
        });
    });

    it('should allow setting SVG scale through metadata', (done) =>
    {
        const loader = new Loader();
        const name = createRandomName();
        const options = {
            metadata: {
                resourceOptions: {
                    scale: 0.5,
                },
            },
        };

        loader.add(name, `${baseUrl}/logo.svg`, options).load(() =>
        {
            const { texture } = loader.resources[name];
            const { width, height } = texture.baseTexture;

            expect(width).toEqual(256);
            expect(height).toEqual(256);
            loader.reset();
            texture.destroy(true);
            done();
        });
    });
});
