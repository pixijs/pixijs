import '~/compressed-textures/ktx/init';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Texture } from '~/rendering';
import type { Container } from '~/scene';

const levelColors = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0],
    [255, 0, 255],
    [0, 255, 255],
    [255, 255, 255],
];

/**
 * Builds a KTX1 file holding an uncompressed RGBA8 texture with one solid color per mip level.
 * @param size - width and height of the base level
 */
function createUncompressedKTX(size: number): ArrayBuffer
{
    const levelSizes = levelColors.map((_, i) => Math.max(size >> i, 1));
    const buffer = new ArrayBuffer(64 + levelSizes.reduce((sum, s) => sum + 4 + (s * s * 4), 0));
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    bytes.set([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A]);
    view.setUint32(12, 0x04030201, true); // endianness
    view.setUint32(16, 0x1401, true); // glType: UNSIGNED_BYTE
    view.setUint32(20, 1, true); // glTypeSize
    view.setUint32(24, 0x1908, true); // glFormat: RGBA
    view.setUint32(28, 0x1908, true); // glInternalFormat: RGBA
    view.setUint32(32, 0x1908, true); // glBaseInternalFormat: RGBA
    view.setUint32(36, size, true);
    view.setUint32(40, size, true);
    view.setUint32(52, 1, true); // numberOfFaces
    view.setUint32(56, levelColors.length, true);

    let offset = 64;

    levelSizes.forEach((s, level) =>
    {
        view.setUint32(offset, s * s * 4, true); // imageSize
        offset += 4;

        for (let p = 0; p < s * s; p++, offset += 4)
        {
            bytes.set([...levelColors[level], 255], offset);
        }
    });

    return buffer;
}

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render every mip level of an uncompressed ktx texture',
    options: { height: 160 },
    create: async (scene: Container) =>
    {
        const src = URL.createObjectURL(new Blob([createUncompressedKTX(64)]));
        const texture = await Assets.load<Texture>({ src, parser: 'ktx' });

        URL.revokeObjectURL(src);

        // A bar `height` pixels tall samples mip level log2(64 / height), so each bar shows one level's color
        let y = 0;

        for (let height = 64; height >= 1; height >>= 1)
        {
            const sprite = new Sprite(texture);

            sprite.position.set(0, y);
            sprite.width = 128;
            sprite.height = height;
            scene.addChild(sprite);

            y += height + 3;
        }
    },
};
