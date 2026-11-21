import '~/compressed-textures/astc/init';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Texture } from '~/rendering';
import type { Container } from '~/scene';

// a red 66x66 image in 12x12 blocks, which pads the texture to 72x72
const size = 66;
const blocks = Math.ceil(size / 12) ** 2;
const bytes = new Uint8Array(16 + (blocks * 16));
const view = new DataView(bytes.buffer);

view.setUint32(0, 0x5CA1AB13, true);
bytes.set([12, 12, 1, size, 0, 0, size, 0, 0, 1, 0, 0], 4);
for (let offset = 16; offset < bytes.length; offset += 16)
{
    // ASTC LDR void-extent blocks encode a constant RGBA16 color.
    bytes.set([0xFC, 0xFD, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], offset);
    [0xFFFF, 0, 0, 0xFFFF].forEach((value, channel) => view.setUint16(offset + 8 + (channel * 2), value, true));
}

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render a compressed texture loaded at resolution 2 at half its pixel size',
    create: async (scene: Container) =>
    {
        const src = URL.createObjectURL(new Blob([bytes]));
        let texture: Texture;

        try
        {
            texture = await Assets.load<Texture>({ src, parser: 'astc', data: { resolution: 2 } });
        }
        finally
        {
            URL.revokeObjectURL(src);
        }

        const sprite = new Sprite(texture);

        sprite.position.set(8, 8);
        scene.addChild(sprite);
    },
};
