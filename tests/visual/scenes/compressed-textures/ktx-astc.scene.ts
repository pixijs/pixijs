import '~/compressed-textures/ktx/init';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Texture } from '~/rendering';
import type { Container } from '~/scene';

const blockColors = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
];

/**
 * Builds a KTX1 file of ASTC void-extent (solid color) blocks, cycling colors per block and per mip level.
 * @param glInternalFormat - the ASTC internal format
 * @param blockSize - width and height of the format's block footprint
 * @param size - width and height of the texture
 * @param levelCount - number of mip levels
 */
function createAstcKTX(glInternalFormat: number, blockSize: number, size: number, levelCount = 1): ArrayBuffer
{
    const levelBlocks = Array.from({ length: levelCount }, (_, level) => Math.ceil(Math.max(size >> level, 1) / blockSize));
    const buffer = new ArrayBuffer(64 + levelBlocks.reduce((sum, blocks) => sum + 4 + (blocks * blocks * 16), 0));
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    bytes.set([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A]);
    view.setUint32(12, 0x04030201, true); // endianness
    view.setUint32(20, 1, true); // glTypeSize
    view.setUint32(28, glInternalFormat, true);
    view.setUint32(32, 0x1908, true); // glBaseInternalFormat: RGBA
    view.setUint32(36, size, true);
    view.setUint32(40, size, true);
    view.setUint32(52, 1, true); // numberOfFaces
    view.setUint32(56, levelCount, true); // numberOfMipmapLevels

    let levelOffset = 64;

    levelBlocks.forEach((blocksPerRow, level) =>
    {
        view.setUint32(levelOffset, blocksPerRow * blocksPerRow * 16, true);
        levelOffset += 4;

        for (let y = 0; y < blocksPerRow; y++)
        {
            for (let x = 0; x < blocksPerRow; x++)
            {
                const offset = levelOffset + (((y * blocksPerRow) + x) * 16);
                const color = blockColors[(x + (y * 2) + level) % blockColors.length];

                bytes.set([0xFC, 0xFD, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], offset);
                color.forEach((c, i) => view.setUint16(offset + 8 + (i * 2), c * 0xFFFF, true));
                view.setUint16(offset + 14, 0xFFFF, true);
            }
        }

        levelOffset += blocksPerRow * blocksPerRow * 16;
    });

    return buffer;
}

async function loadKTX(buffer: ArrayBuffer): Promise<Texture>
{
    const src = URL.createObjectURL(new Blob([buffer]));
    const texture = await Assets.load<Texture>({ src, parser: 'ktx' });

    URL.revokeObjectURL(src);

    return texture;
}

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render ktx astc textures whose blocks are larger than 4x4',
    options: { width: 270, height: 96 },
    create: async (scene: Container) =>
    {
        // 70 and 96 are whole blocks; 64 and 25 aren't, so their sources are padded to 72 and 36
        const textures = await Promise.all([
            loadKTX(createAstcKTX(0x93B2, 5, 70)),
            loadKTX(createAstcKTX(0x93BD, 12, 96)),
            loadKTX(createAstcKTX(0x93BD, 12, 64, 7)),
            loadKTX(createAstcKTX(0x93BD, 12, 25, 5)),
        ]);
        let x = 0;

        for (const texture of textures)
        {
            const sprite = new Sprite(texture);

            sprite.x = x;
            x += texture.width + 4;
            scene.addChild(sprite);
        }
    },
};
