import '~/compressed-textures/astc/init';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Texture } from '~/rendering';
import type { Container } from '~/scene';

const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0]];
const size = 66;

/**
 * Builds a raw ASTC file with asymmetric constant-color blocks and partial edge blocks.
 * @param blockSize - Width and height of the ASTC block footprint.
 */
function createASTC(blockSize: number): ArrayBuffer
{
    const columns = Math.ceil(size / blockSize);
    const buffer = new ArrayBuffer(16 + (columns * columns * 16));
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    view.setUint32(0, 0x5CA1AB13, true);
    bytes.set([blockSize, blockSize, 1, size, 0, 0, size, 0, 0, 1, 0, 0], 4);
    for (let y = 0; y < columns; y++)
    {
        for (let x = 0; x < columns; x++)
        {
            const offset = 16 + (((y * columns) + x) * 16);
            const color = colors[(x + (y * 2)) % colors.length];

            // ASTC LDR void-extent blocks encode a constant RGBA16 color.
            bytes.set([0xFC, 0xFD, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], offset);
            for (let channel = 0; channel < 4; channel++)
            {
                view.setUint16(offset + 8 + (channel * 2), (color[channel] ?? 255) * 257, true);
            }
        }
    }

    return buffer;
}

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should load raw astc textures with different footprints and partial edge blocks',
    options: { width: size * 3, height: size },
    create: async (scene: Container) =>
    {
        for (const [index, blockSize] of [4, 5, 12].entries())
        {
            const src = URL.createObjectURL(new Blob([createASTC(blockSize)]));
            let texture: Texture;

            try
            {
                texture = await Assets.load<Texture>({ src, parser: 'astc' });
            }
            finally
            {
                URL.revokeObjectURL(src);
            }

            const sprite = new Sprite(texture);

            sprite.x = index * size;
            scene.addChild(sprite);
        }
    },
};
