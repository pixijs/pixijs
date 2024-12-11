import '~/spritesheet/init';
import { Assets } from '../Assets';
import { basePath, getApp } from '@test-utils';

import type { Texture } from '~/rendering';

describe('Assets Unresolved', () =>
{
    beforeAll(async () =>
    {
        await getApp();
    });

    beforeEach(() =>
    {
        // reset the loader
        Assets.reset();
    });

    it('should load unresolved assets', async () =>
    {
        await Assets.init({
            basePath,
        });

        const bunny = await Assets.load<Texture>('textures/bunny.{png,webp}');
        const bunny5 = await Assets.load<Texture>({ src: 'textures/bunny.1.{png,webp}' });
        const bunny6 = await Assets.load<Texture>({ src: ['textures/bunny.2.{png,webp}'] });
        const bunny7 = await Assets.load<Texture>({
            src: [
                {
                    src: 'textures/bunny.3.png',
                },
                {
                    src: 'textures/bunny.3.webp',
                }
            ]
        });
        const bunny8 = await Assets.load({
            src: {
                src: 'textures/bunny.4.png',
            },
        });

        expect(bunny.source.label).toBe(`${basePath}textures/bunny.webp`);
        expect(bunny5.source.label).toBe(`${basePath}textures/bunny.1.webp`);
        expect(bunny6.source.label).toBe(`${basePath}textures/bunny.2.webp`);
        expect(bunny7.source.label).toBe(`${basePath}textures/bunny.3.webp`);
        expect(bunny8.source.label).toBe(`${basePath}textures/bunny.4.png`);
    });

    it('should pass data into the load parser', async () =>
    {
        const testParser = {
            test: jest.fn(() => true),
            load: jest.fn(() => undefined),
        };

        Assets.loader['_parsers'].push(testParser as any);

        await Assets.load({ src: 'test', data: { hello: 'world' }, loadParser: 'test' });

        const secondParam = (testParser.load.mock.calls as any)[0][1];

        expect(secondParam.data).toEqual({ hello: 'world' });
    });
});
