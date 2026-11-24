/**
 * A compressed texture format's block footprint in pixels and byte size
 * @internal
 */
export type BlockData = { blockBytes: number, blockWidth: number, blockHeight: number };

/**
 * Block footprint and byte size of every compressed texture format
 * @internal
 */
export const blockDataMap: Record<string, BlockData> = {
    'bc1-rgba-unorm': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'bc1-rgba-unorm-srgb': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'bc2-rgba-unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc2-rgba-unorm-srgb': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc3-rgba-unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc3-rgba-unorm-srgb': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc4-r-unorm': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'bc4-r-snorm': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'bc5-rg-unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc5-rg-snorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc6h-rgb-ufloat': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc6h-rgb-float': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc7-rgba-unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'bc7-rgba-unorm-srgb': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'etc2-rgb8unorm': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'etc2-rgb8unorm-srgb': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'etc2-rgb8a1unorm': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'etc2-rgb8a1unorm-srgb': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'etc2-rgba8unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'etc2-rgba8unorm-srgb': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'eac-r11unorm': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'eac-r11snorm': { blockBytes: 8, blockWidth: 4, blockHeight: 4 },
    'eac-rg11unorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
    'eac-rg11snorm': { blockBytes: 16, blockWidth: 4, blockHeight: 4 },
};

for (const footprint of [
    '4x4', '5x4', '5x5', '6x5', '6x6', '8x5', '8x6', '8x8', '10x5', '10x6', '10x8', '10x10', '12x10', '12x12',
])
{
    const [blockWidth, blockHeight] = footprint.split('x').map(Number);
    const blockData = { blockBytes: 16, blockWidth, blockHeight };

    blockDataMap[`astc-${footprint}-unorm`] = blockData;
    blockDataMap[`astc-${footprint}-unorm-srgb`] = blockData;
}
