import { CompressedSource } from '../sources/CompressedSource';
import { Texture } from '../Texture';
import { getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { Sprite } from '~/scene';

import type { Renderer } from '~/rendering';

const RED = [255, 0, 0, 255];

function createRedSprite(): Sprite
{
    const source = new CompressedSource({
        resource: [new Uint8Array([...RED, ...RED, ...RED, ...RED])], width: 2, height: 2,
    });

    return new Sprite(new Texture({ source }));
}

function firstPixel(renderer: Renderer, sprite: Sprite): number[]
{
    return Array.from(renderer.extract.pixels(sprite).pixels.slice(0, 4));
}

describe('CompressedSource', () =>
{
    it('should read levels with no format as rgba8unorm', () =>
    {
        expect(new CompressedSource({ resource: [new Uint8Array(4)], width: 1, height: 1 }).format).toBe('rgba8unorm');
    });

    it('should keep a format that is passed', () =>
    {
        const source = new CompressedSource({ resource: [new Uint8Array(4)], width: 1, height: 1, format: 'bgra8unorm' });

        expect(source.format).toBe('bgra8unorm');
    });

    it.each([1, 2] as const)('should draw RGBA bytes with no format as they are on WebGL%i', async (preferWebGLVersion) =>
    {
        const renderer = await getWebGLRenderer({ preferWebGLVersion });
        const sprite = createRedSprite();

        expect(firstPixel(renderer, sprite)).toEqual(RED);

        sprite.destroy({ texture: true, textureSource: true });
        renderer.destroy();
    });

    itLocalOnly('should draw RGBA bytes with no format as they are on WebGPU', async () =>
    {
        const renderer = await getWebGPURenderer();
        const sprite = createRedSprite();

        expect(firstPixel(renderer, sprite)).toEqual(RED);

        sprite.destroy({ texture: true, textureSource: true });
        renderer.destroy();
    });
});
