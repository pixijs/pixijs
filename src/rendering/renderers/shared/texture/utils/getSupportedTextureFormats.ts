import { getSupportedCompressedTextureFormats } from './getSupportedCompressedTextureFormats';

import type { TEXTURE_FORMATS } from '../const';

export const nonCompressedFormats: TEXTURE_FORMATS[] = [
    // 8-bit formats
    'r8unorm',
    'r8snorm',
    'r8uint',
    'r8sint',

    // 16-bit formats
    'r16uint',
    'r16sint',
    'r16float',
    'rg8unorm',
    'rg8snorm',
    'rg8uint',
    'rg8sint',

    // 32-bit formats
    'r32uint',
    'r32sint',
    'r32float',
    'rg16uint',
    'rg16sint',
    'rg16float',
    'rgba8unorm',
    'rgba8unorm-srgb',
    'rgba8snorm',
    'rgba8uint',
    'rgba8sint',
    'bgra8unorm',
    'bgra8unorm-srgb',
    // Packed 32-bit formats
    'rgb9e5ufloat',
    'rgb10a2unorm',
    'rg11b10ufloat',

    // 64-bit formats
    'rg32uint',
    'rg32sint',
    'rg32float',
    'rgba16uint',
    'rgba16sint',
    'rgba16float',

    // 128-bit formats
    'rgba32uint',
    'rgba32sint',
    'rgba32float',

    // Depth/stencil formats
    'stencil8',
    'depth16unorm',
    'depth24plus',
    'depth24plus-stencil8',
    'depth32float',

    // "depth32float-stencil8" feature
    'depth32float-stencil8',
];

let supportedTextureFormats: TEXTURE_FORMATS[];

export async function getSupportedTextureFormats(): Promise<TEXTURE_FORMATS[]>
{
    if (supportedTextureFormats !== undefined) return supportedTextureFormats;

    const compressedTextureFormats = await getSupportedCompressedTextureFormats();

    supportedTextureFormats = [
        ...nonCompressedFormats,
        ...compressedTextureFormats,
    ];

    return supportedTextureFormats;
}

