import { Assets } from '@pixi/assets';
import '@pixi/spritesheet';
import { basePath } from './basePath';

describe('Assets Unresolved', () =>
{
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

        const bunny = await Assets.load('textures/bunny.{png,webp}');
        const bunny5 = await Assets.load({ src: 'textures/bunny.1.{png,webp}' });
        const bunny6 = await Assets.load({ src: ['textures/bunny.2.{png,webp}'] });
        const bunny7 = await Assets.load({
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

        expect(bunny.baseTexture.resource.src).toBe(`${basePath}textures/bunny.webp`);
        expect(bunny5.baseTexture.resource.src).toBe(`${basePath}textures/bunny.1.webp`);
        expect(bunny6.baseTexture.resource.src).toBe(`${basePath}textures/bunny.2.webp`);
        expect(bunny7.baseTexture.resource.src).toBe(`${basePath}textures/bunny.3.webp`);
        expect(bunny8.baseTexture.resource.src).toBe(`${basePath}textures/bunny.4.png`);
    });

    it('should pass data into the load parser', async () =>
    {
        const testParser = {
            test: jest.fn(() => true),
            load: jest.fn(() => undefined),
        };

        Assets.loader['_parsers'].push(testParser);

        await Assets.load({ src: 'test', data: { hello: 'world' }, loadParser: 'test' });

        const secondParam = (testParser.load.mock.calls as any)[0][1];

        expect(secondParam.data).toEqual({ hello: 'world' });
    });
});
