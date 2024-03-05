import type { COMPRESSED_TEXTURE_FORMATS } from '../types';

const glFormatToGPUFormatMap: Record<number, COMPRESSED_TEXTURE_FORMATS> = {
    6408: 'rgba8unorm',
    32856: 'bgra8unorm', //
    32857: 'rgb10a2unorm',
    33189: 'depth16unorm',
    33190: 'depth24plus',
    33321: 'r8unorm',
    33323: 'rg8unorm',
    33325: 'r16float',
    33326: 'r32float',
    33327: 'rg16float',
    33328: 'rg32float',
    33329: 'r8sint',
    33330: 'r8uint',
    33331: 'r16sint',
    33332: 'r16uint',
    33333: 'r32sint',
    33334: 'r32uint',
    33335: 'rg8sint',
    33336: 'rg8uint',
    33337: 'rg16sint',
    33338: 'rg16uint',
    33339: 'rg32sint',
    33340: 'rg32uint',
    33778: 'bc2-rgba-unorm',
    33779: 'bc3-rgba-unorm',
    34836: 'rgba32float',
    34842: 'rgba16float',
    35056: 'depth24plus-stencil8',
    35898: 'rg11b10ufloat',
    35901: 'rgb9e5ufloat',
    35907: 'rgba8unorm-srgb', // bgra8unorm-srgb
    36012: 'depth32float',
    36013: 'depth32float-stencil8',
    36168: 'stencil8',
    36208: 'rgba32uint',
    36214: 'rgba16uint',
    36220: 'rgba8uint',
    36226: 'rgba32sint',
    36232: 'rgba16sint',
    36238: 'rgba8sint',
    36492: 'bc7-rgba-unorm',
    36756: 'r8snorm',
    36757: 'rg8snorm',
    36759: 'rgba8snorm',
    37496: 'etc2-rgba8unorm',
    37808: 'astc-4x4-unorm'
};

export function glFormatToGPUFormat(glInternalFormat: number): COMPRESSED_TEXTURE_FORMATS
{
    const format = glFormatToGPUFormatMap[glInternalFormat];

    if (format)
    {
        return format;
    }

    throw new Error(`Unsupported glInternalFormat: ${glInternalFormat}`);
}
