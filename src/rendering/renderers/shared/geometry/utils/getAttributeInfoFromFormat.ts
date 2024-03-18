import type { VertexFormat } from '../const';

const attributeFormatData = {
    uint8x2: { size: 2, stride: 2, normalised: false },
    uint8x4: { size: 4, stride: 4, normalised: false },
    sint8x2: { size: 2, stride: 2, normalised: false },
    sint8x4: { size: 4, stride: 4, normalised: false },
    unorm8x2: { size: 2, stride: 2, normalised: true },
    unorm8x4: { size: 4, stride: 4, normalised: true },
    snorm8x2: { size: 2, stride: 2, normalised: true },
    snorm8x4: { size: 4, stride: 4, normalised: true },
    uint16x2: { size: 2, stride: 4, normalised: false },
    uint16x4: { size: 4, stride: 8, normalised: false },
    sint16x2: { size: 2, stride: 4, normalised: false },
    sint16x4: { size: 4, stride: 8, normalised: false },
    unorm16x2: { size: 2, stride: 4, normalised: true },
    unorm16x4: { size: 4, stride: 8, normalised: true },
    snorm16x2: { size: 2, stride: 4, normalised: true },
    snorm16x4: { size: 4, stride: 8, normalised: true },
    float16x2: { size: 2, stride: 4, normalised: false },
    float16x4: { size: 4, stride: 8, normalised: false },
    float32: { size: 1, stride: 4, normalised: false },
    float32x2: { size: 2, stride: 8, normalised: false },
    float32x3: { size: 3, stride: 12, normalised: false },
    float32x4: { size: 4, stride: 16, normalised: false },
    uint32: { size: 1, stride: 4, normalised: false },
    uint32x2: { size: 2, stride: 8, normalised: false },
    uint32x3: { size: 3, stride: 12, normalised: false },
    uint32x4: { size: 4, stride: 16, normalised: false },
    sint32: { size: 1, stride: 4, normalised: false },
    sint32x2: { size: 2, stride: 8, normalised: false },
    sint32x3: { size: 3, stride: 12, normalised: false },
    sint32x4: { size: 4, stride: 16, normalised: false },
};

export function getAttributeInfoFromFormat(format: VertexFormat): { size: number; stride: number; normalised: boolean }
{
    return attributeFormatData[format] ?? attributeFormatData.float32;
}
