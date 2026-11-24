import { BufferImageSource, Texture } from '~/rendering';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

// one value per texel row, so every row draws as a solid stripe
const red = [255, 64, 191, 0];
const green = [0, 255, 0, 255];
// half-float bits of 1, 0.25, 0.75 and 0
const redHalf = [0x3c00, 0x3400, 0x3a00, 0];

const height = 4;

function fillRows(data: Uint8Array | Uint16Array, width: number, channels: number[][]): void
{
    for (let y = 0; y < height; y++)
    {
        for (let x = 0; x < width; x++)
        {
            channels.forEach((values, c) =>
            {
                data[(((y * width) + x) * channels.length) + c] = values[y];
            });
        }
    }
}

export const scene: TestScene = {
    it: 'should upload buffer textures whose rows are not a multiple of 4 bytes',
    renderers: { webgpu: true, webgl2: true, webgl1: false, canvas: false },
    create: async (scene: Container, renderer: Renderer) =>
    {
        const r8 = new Uint8Array(5 * height);
        const rg8 = new Uint8Array(3 * height * 2);
        const r16f = new Uint16Array(3 * height);

        fillRows(r8, 5, [red]);
        fillRows(rg8, 3, [red, green]);
        fillRows(r16f, 3, [redHalf]);

        const sources = [
            new BufferImageSource({ resource: r8, width: 5, height, format: 'r8unorm', scaleMode: 'nearest' }),
            new BufferImageSource({ resource: rg8, width: 3, height, format: 'rg8unorm', scaleMode: 'nearest' }),
            new BufferImageSource({ resource: r16f, width: 3, height, format: 'r16float', scaleMode: 'nearest' }),
        ];

        // allocated bright red, then rows 1 to 3 rewritten through a partial update
        const partial = new Uint8Array(5 * height).fill(255);
        const partialSource = new BufferImageSource({
            resource: partial, width: 5, height, format: 'r8unorm', scaleMode: 'nearest',
        });

        renderer.texture.initSource(partialSource);
        partial.set(r8.subarray(5), 5);
        partialSource.update(5, 20);
        sources.push(partialSource);

        sources.forEach((source, i) =>
        {
            const sprite = new Sprite(new Texture({ source }));

            sprite.position.set(2 + (i * 32), 2);
            sprite.width = 28;
            sprite.height = 64;
            scene.addChild(sprite);
        });
    },
};
