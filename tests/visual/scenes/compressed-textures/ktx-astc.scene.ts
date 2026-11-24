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
 * Builds a single-level KTX1 file of ASTC void-extent (solid color) blocks, cycling colors per block.
 * @param glInternalFormat - the ASTC internal format
 * @param blockSize - width and height of the format's block footprint
 * @param size - width and height of the texture
 */
function createAstcKTX(glInternalFormat: number, blockSize: number, size: number): ArrayBuffer
{
    const blocksPerRow = Math.ceil(size / blockSize);
    const imageSize = blocksPerRow * blocksPerRow * 16;
    const buffer = new ArrayBuffer(64 + 4 + imageSize);
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
    view.setUint32(56, 1, true); // numberOfMipmapLevels
    view.setUint32(64, imageSize, true);

    for (let y = 0; y < blocksPerRow; y++)
    {
        for (let x = 0; x < blocksPerRow; x++)
        {
            const offset = 68 + (((y * blocksPerRow) + x) * 16);
            const color = blockColors[(x + (y * 2)) % blockColors.length];

            bytes.set([0xFC, 0xFD, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], offset);
            color.forEach((c, i) => view.setUint16(offset + 8 + (i * 2), c * 0xFFFF, true));
            view.setUint16(offset + 14, 0xFFFF, true);
        }
    }

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
    options: { width: 170, height: 96 },
    create: async (scene: Container) =>
    {
        // Sizes are whole blocks so WebGPU doesn't pad the texture and squeeze the image
        const astc5x5 = new Sprite(await loadKTX(createAstcKTX(0x93B2, 5, 70)));
        const astc12x12 = new Sprite(await loadKTX(createAstcKTX(0x93BD, 12, 96)));

        astc12x12.x = 74;
        scene.addChild(astc5x5, astc12x12);
    },
};
