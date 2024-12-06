import type { TEXTURE_FORMATS } from '../../rendering/renderers/shared/texture/const';

// http://msdn.microsoft.com/en-us/library/bb943991.aspx/
/**
 * DWORD offsets of the DDS file header fields (relative to file start).
 * @ignore
 */
const DDS_HEADER_FIELDS = {
    MAGIC: 0,
    SIZE: 1,
    FLAGS: 2,
    HEIGHT: 3,
    WIDTH: 4,
    MIPMAP_COUNT: 7,
    PIXEL_FORMAT: 19,
    PF_FLAGS: 20,
    FOURCC: 21,
    RGB_BITCOUNT: 22,
    R_BIT_MASK: 23,
    G_BIT_MASK: 24,
    B_BIT_MASK: 25,
    A_BIT_MASK: 26,
};

/**
 * DWORD offsets of the DDS_HEADER_DX10 fields.
 * @ignore
 */
const DDS_DX10_FIELDS = {
    DXGI_FORMAT: 0,
    RESOURCE_DIMENSION: 1,
    MISC_FLAG: 2,
    ARRAY_SIZE: 3,
    MISC_FLAGS2: 4,
};

/**
 * @see https://docs.microsoft.com/en-us/windows/win32/api/dxgiformat/ne-dxgiformat-dxgi_format
 * This is way over-blown for us! Lend us a hand, and remove the ones that aren't used (but set the remaining
 * ones to their correct value)
 * @ignore
 */
export enum DXGI_FORMAT
{
    DXGI_FORMAT_UNKNOWN,
    DXGI_FORMAT_R32G32B32A32_TYPELESS,
    DXGI_FORMAT_R32G32B32A32_FLOAT,
    DXGI_FORMAT_R32G32B32A32_UINT,
    DXGI_FORMAT_R32G32B32A32_SINT,
    DXGI_FORMAT_R32G32B32_TYPELESS,
    DXGI_FORMAT_R32G32B32_FLOAT,
    DXGI_FORMAT_R32G32B32_UINT,
    DXGI_FORMAT_R32G32B32_SINT,
    DXGI_FORMAT_R16G16B16A16_TYPELESS,
    DXGI_FORMAT_R16G16B16A16_FLOAT,
    DXGI_FORMAT_R16G16B16A16_UNORM,
    DXGI_FORMAT_R16G16B16A16_UINT,
    DXGI_FORMAT_R16G16B16A16_SNORM,
    DXGI_FORMAT_R16G16B16A16_SINT,
    DXGI_FORMAT_R32G32_TYPELESS,
    DXGI_FORMAT_R32G32_FLOAT,
    DXGI_FORMAT_R32G32_UINT,
    DXGI_FORMAT_R32G32_SINT,
    DXGI_FORMAT_R32G8X24_TYPELESS,
    DXGI_FORMAT_D32_FLOAT_S8X24_UINT,
    DXGI_FORMAT_R32_FLOAT_X8X24_TYPELESS,
    DXGI_FORMAT_X32_TYPELESS_G8X24_UINT,
    DXGI_FORMAT_R10G10B10A2_TYPELESS,
    DXGI_FORMAT_R10G10B10A2_UNORM,
    DXGI_FORMAT_R10G10B10A2_UINT,
    DXGI_FORMAT_R11G11B10_FLOAT,
    DXGI_FORMAT_R8G8B8A8_TYPELESS,
    DXGI_FORMAT_R8G8B8A8_UNORM,
    DXGI_FORMAT_R8G8B8A8_UNORM_SRGB,
    DXGI_FORMAT_R8G8B8A8_UINT,
    DXGI_FORMAT_R8G8B8A8_SNORM,
    DXGI_FORMAT_R8G8B8A8_SINT,
    DXGI_FORMAT_R16G16_TYPELESS,
    DXGI_FORMAT_R16G16_FLOAT,
    DXGI_FORMAT_R16G16_UNORM,
    DXGI_FORMAT_R16G16_UINT,
    DXGI_FORMAT_R16G16_SNORM,
    DXGI_FORMAT_R16G16_SINT,
    DXGI_FORMAT_R32_TYPELESS,
    DXGI_FORMAT_D32_FLOAT,
    DXGI_FORMAT_R32_FLOAT,
    DXGI_FORMAT_R32_UINT,
    DXGI_FORMAT_R32_SINT,
    DXGI_FORMAT_R24G8_TYPELESS,
    DXGI_FORMAT_D24_UNORM_S8_UINT,
    DXGI_FORMAT_R24_UNORM_X8_TYPELESS,
    DXGI_FORMAT_X24_TYPELESS_G8_UINT,
    DXGI_FORMAT_R8G8_TYPELESS,
    DXGI_FORMAT_R8G8_UNORM,
    DXGI_FORMAT_R8G8_UINT,
    DXGI_FORMAT_R8G8_SNORM,
    DXGI_FORMAT_R8G8_SINT,
    DXGI_FORMAT_R16_TYPELESS,
    DXGI_FORMAT_R16_FLOAT,
    DXGI_FORMAT_D16_UNORM,
    DXGI_FORMAT_R16_UNORM,
    DXGI_FORMAT_R16_UINT,
    DXGI_FORMAT_R16_SNORM,
    DXGI_FORMAT_R16_SINT,
    DXGI_FORMAT_R8_TYPELESS,
    DXGI_FORMAT_R8_UNORM,
    DXGI_FORMAT_R8_UINT,
    DXGI_FORMAT_R8_SNORM,
    DXGI_FORMAT_R8_SINT,
    DXGI_FORMAT_A8_UNORM,
    DXGI_FORMAT_R1_UNORM,
    DXGI_FORMAT_R9G9B9E5_SHAREDEXP,
    DXGI_FORMAT_R8G8_B8G8_UNORM,
    DXGI_FORMAT_G8R8_G8B8_UNORM,
    DXGI_FORMAT_BC1_TYPELESS,
    DXGI_FORMAT_BC1_UNORM,
    DXGI_FORMAT_BC1_UNORM_SRGB,
    DXGI_FORMAT_BC2_TYPELESS,
    DXGI_FORMAT_BC2_UNORM,
    DXGI_FORMAT_BC2_UNORM_SRGB,
    DXGI_FORMAT_BC3_TYPELESS,
    DXGI_FORMAT_BC3_UNORM,
    DXGI_FORMAT_BC3_UNORM_SRGB,
    DXGI_FORMAT_BC4_TYPELESS,
    DXGI_FORMAT_BC4_UNORM,
    DXGI_FORMAT_BC4_SNORM,
    DXGI_FORMAT_BC5_TYPELESS,
    DXGI_FORMAT_BC5_UNORM,
    DXGI_FORMAT_BC5_SNORM,
    DXGI_FORMAT_B5G6R5_UNORM,
    DXGI_FORMAT_B5G5R5A1_UNORM,
    DXGI_FORMAT_B8G8R8A8_UNORM,
    DXGI_FORMAT_B8G8R8X8_UNORM,
    DXGI_FORMAT_R10G10B10_XR_BIAS_A2_UNORM,
    DXGI_FORMAT_B8G8R8A8_TYPELESS,
    DXGI_FORMAT_B8G8R8A8_UNORM_SRGB,
    DXGI_FORMAT_B8G8R8X8_TYPELESS,
    DXGI_FORMAT_B8G8R8X8_UNORM_SRGB,
    DXGI_FORMAT_BC6H_TYPELESS,
    DXGI_FORMAT_BC6H_UF16,
    DXGI_FORMAT_BC6H_SF16,
    DXGI_FORMAT_BC7_TYPELESS,
    DXGI_FORMAT_BC7_UNORM,
    DXGI_FORMAT_BC7_UNORM_SRGB,
    DXGI_FORMAT_AYUV,
    DXGI_FORMAT_Y410,
    DXGI_FORMAT_Y416,
    DXGI_FORMAT_NV12,
    DXGI_FORMAT_P010,
    DXGI_FORMAT_P016,
    DXGI_FORMAT_420_OPAQUE,
    DXGI_FORMAT_YUY2,
    DXGI_FORMAT_Y210,
    DXGI_FORMAT_Y216,
    DXGI_FORMAT_NV11,
    DXGI_FORMAT_AI44,
    DXGI_FORMAT_IA44,
    DXGI_FORMAT_P8,
    DXGI_FORMAT_A8P8,
    DXGI_FORMAT_B4G4R4A4_UNORM,
    DXGI_FORMAT_P208,
    DXGI_FORMAT_V208,
    DXGI_FORMAT_V408,
    DXGI_FORMAT_SAMPLER_FEEDBACK_MIN_MIP_OPAQUE,
    DXGI_FORMAT_SAMPLER_FEEDBACK_MIP_REGION_USED_OPAQUE,
    DXGI_FORMAT_FORCE_UINT
}

/**
 * Possible values of the field {@link DDS_DX10_FIELDS.RESOURCE_DIMENSION}
 * @ignore
 */
export enum D3D10_RESOURCE_DIMENSION
{
    DDS_DIMENSION_TEXTURE1D = 2,
    DDS_DIMENSION_TEXTURE2D = 3,
    DDS_DIMENSION_TEXTURE3D = 6
}

function fourCCToInt32(value: string)
{
    return value.charCodeAt(0)
        + (value.charCodeAt(1) << 8)
        + (value.charCodeAt(2) << 16)
        + (value.charCodeAt(3) << 24);
}

// Four character codes for DXTn formats
// https://learn.microsoft.com/en-us/windows/win32/direct3ddds/dx-graphics-dds-pguide
// https://learn.microsoft.com/en-us/windows/win32/direct3d9/d3dformat
export enum D3DFMT
{
    UNKNOWN = 0,
    R8G8B8 = 20,
    A8R8G8B8 = 21,
    X8R8G8B8 = 22,
    R5G6B5 = 23,
    X1R5G5B5 = 24,
    A1R5G5B5 = 25,
    A4R4G4B4 = 26,
    R3G3B2 = 27,
    A8 = 28,
    A8R3G3B2 = 29,
    X4R4G4B4 = 30,
    A2B10G10R10 = 31,
    A8B8G8R8 = 32,
    X8B8G8R8 = 33,
    G16R16 = 34,
    A2R10G10B10 = 35,
    A16B16G16R16 = 36,
    A8P8 = 40,
    P8 = 41,
    L8 = 50,
    A8L8 = 51,
    A4L4 = 52,
    V8U8 = 60,
    L6V5U5 = 61,
    X8L8V8U8 = 62,
    Q8W8V8U8 = 63,
    V16U16 = 64,
    A2W10V10U10 = 67,
    Q16W16V16U16 = 110,
    R16F = 111,
    G16R16F = 112,
    A16B16G16R16F = 113,
    R32F = 114,
    G32R32F = 115,
    A32B32G32R32F = 116,
    UYVY = fourCCToInt32('UYVY'),
    R8G8_B8G8 = fourCCToInt32('RGBG'),
    YUY2 = fourCCToInt32('YUY2'),
    D3DFMT_G8R8_G8B8 = fourCCToInt32('GRGB'),
    DXT1 = fourCCToInt32('DXT1'),
    DXT2 = fourCCToInt32('DXT2'),
    DXT3 = fourCCToInt32('DXT3'),
    DXT4 = fourCCToInt32('DXT4'),
    DXT5 = fourCCToInt32('DXT5'),
    ATI1 = fourCCToInt32('ATI1'),
    AT1N = fourCCToInt32('AT1N'),
    ATI2 = fourCCToInt32('ATI2'),
    AT2N = fourCCToInt32('AT2N'),
    BC4U = fourCCToInt32('BC4U'),
    BC4S = fourCCToInt32('BC4S'),
    BC5U = fourCCToInt32('BC5U'),
    BC5S = fourCCToInt32('BC5S'),

    DX10 = fourCCToInt32('DX10'),
}

/**
 * Maps `FOURCC_*` formats to {@link TEXTURE_FORMATS}.
 * https://en.wikipedia.org/wiki/S3_Texture_Compression#S3TC_format_comparison
 * https://github.com/microsoft/DirectXTex/blob/main/DDSTextureLoader/DDSTextureLoader11.cpp
 * @ignore
 */
export const FOURCC_TO_TEXTURE_FORMAT: { [id: number]: TEXTURE_FORMATS } = {
    [D3DFMT.DXT1]: 'bc1-rgba-unorm',
    [D3DFMT.DXT2]: 'bc2-rgba-unorm',
    [D3DFMT.DXT3]: 'bc2-rgba-unorm',
    [D3DFMT.DXT4]: 'bc3-rgba-unorm',
    [D3DFMT.DXT5]: 'bc3-rgba-unorm',

    [D3DFMT.ATI1]: 'bc4-r-unorm',
    [D3DFMT.BC4U]: 'bc4-r-unorm',
    [D3DFMT.BC4S]: 'bc4-r-snorm',

    [D3DFMT.ATI2]: 'bc5-rg-unorm',
    [D3DFMT.BC5U]: 'bc5-rg-unorm',
    [D3DFMT.BC5S]: 'bc5-rg-snorm',

    [D3DFMT.A16B16G16R16]: 'rgba16uint',
    [D3DFMT.Q16W16V16U16]: 'rgba16sint',
    [D3DFMT.R16F]: 'r16float',
    [D3DFMT.G16R16F]: 'rg16float',
    [D3DFMT.A16B16G16R16F]: 'rgba16float',
    [D3DFMT.R32F]: 'r32float',
    [D3DFMT.G32R32F]: 'rg32float',
    [D3DFMT.A32B32G32R32F]: 'rgba32float',
};

/**
 * Maps {@link DXGI_FORMAT} to {@link TEXTURE_FORMATS}
 * @ignore
 */
export const DXGI_TO_TEXTURE_FORMAT: { [id: number]: TEXTURE_FORMATS } = {
    [DXGI_FORMAT.DXGI_FORMAT_BC1_TYPELESS]: 'bc1-rgba-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC1_UNORM]: 'bc1-rgba-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC1_UNORM_SRGB]: 'bc1-rgba-unorm-srgb',

    [DXGI_FORMAT.DXGI_FORMAT_BC2_TYPELESS]: 'bc2-rgba-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC2_UNORM]: 'bc2-rgba-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC2_UNORM_SRGB]: 'bc2-rgba-unorm-srgb',

    [DXGI_FORMAT.DXGI_FORMAT_BC3_TYPELESS]: 'bc3-rgba-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC3_UNORM]: 'bc3-rgba-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC3_UNORM_SRGB]: 'bc3-rgba-unorm-srgb',

    [DXGI_FORMAT.DXGI_FORMAT_BC4_TYPELESS]: 'bc4-r-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC4_UNORM]: 'bc4-r-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC4_SNORM]: 'bc4-r-snorm',

    [DXGI_FORMAT.DXGI_FORMAT_BC5_TYPELESS]: 'bc5-rg-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC5_UNORM]: 'bc5-rg-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC5_SNORM]: 'bc5-rg-snorm',

    [DXGI_FORMAT.DXGI_FORMAT_BC6H_TYPELESS]: 'bc6h-rgb-ufloat',
    [DXGI_FORMAT.DXGI_FORMAT_BC6H_UF16]: 'bc6h-rgb-ufloat',
    [DXGI_FORMAT.DXGI_FORMAT_BC6H_SF16]: 'bc6h-rgb-float',

    [DXGI_FORMAT.DXGI_FORMAT_BC7_TYPELESS]: 'bc7-rgba-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC7_UNORM]: 'bc7-rgba-unorm',
    [DXGI_FORMAT.DXGI_FORMAT_BC7_UNORM_SRGB]: 'bc7-rgba-unorm-srgb',

    [DXGI_FORMAT.DXGI_FORMAT_R8G8B8A8_UNORM]: 'rgba8unorm',
    [DXGI_FORMAT.DXGI_FORMAT_R8G8B8A8_UNORM_SRGB]: 'rgba8unorm-srgb',
    [DXGI_FORMAT.DXGI_FORMAT_B8G8R8A8_UNORM]: 'bgra8unorm',
    [DXGI_FORMAT.DXGI_FORMAT_B8G8R8A8_UNORM_SRGB]: 'bgra8unorm-srgb',
    [DXGI_FORMAT.DXGI_FORMAT_R32_FLOAT]: 'r32float',

    [DXGI_FORMAT.DXGI_FORMAT_R8G8_UNORM]: 'rg8unorm',
    [DXGI_FORMAT.DXGI_FORMAT_R16_UNORM]: 'r16uint',

    [DXGI_FORMAT.DXGI_FORMAT_R8_UNORM]: 'r8unorm',
    [DXGI_FORMAT.DXGI_FORMAT_R10G10B10A2_UNORM]: 'rgb10a2unorm',

    [DXGI_FORMAT.DXGI_FORMAT_R16G16B16A16_UNORM]: 'rgba16uint',
    [DXGI_FORMAT.DXGI_FORMAT_R16G16B16A16_SNORM]: 'rgba16sint',
    [DXGI_FORMAT.DXGI_FORMAT_R16G16B16A16_FLOAT]: 'rgba16float',
    [DXGI_FORMAT.DXGI_FORMAT_R16_FLOAT]: 'r16float',
    [DXGI_FORMAT.DXGI_FORMAT_R16G16_FLOAT]: 'rg16float',
    [DXGI_FORMAT.DXGI_FORMAT_R32G32_FLOAT]: 'rg32float',
    [DXGI_FORMAT.DXGI_FORMAT_R32G32B32A32_FLOAT]: 'rgba32float',

};

export const DDS = {
    MAGIC_VALUE: 0x20534444,
    MAGIC_SIZE: 4,
    HEADER_SIZE: 124,
    HEADER_DX10_SIZE: 20,
    PIXEL_FORMAT_FLAGS: {
        // PIXEL_FORMAT flags
        // https://github.com/Microsoft/DirectXTex/blob/main/DirectXTex/DDS.h
        // https://learn.microsoft.com/en-us/windows/win32/direct3ddds/dds-pixelformat
        ALPHAPIXELS: 0x1,
        ALPHA: 0x2,
        FOURCC: 0x4,
        RGB: 0x40,
        RGBA: 0x41,
        YUV: 0x200,
        LUMINANCE: 0x20000,
        LUMINANCEA: 0x20001,
    },

    RESOURCE_MISC_TEXTURECUBE: 0x4,

    HEADER_FIELDS: DDS_HEADER_FIELDS,
    HEADER_DX10_FIELDS: DDS_DX10_FIELDS,
    DXGI_FORMAT,
    D3D10_RESOURCE_DIMENSION,
    D3DFMT
};

// formats and block size (in bytes)
export const TEXTURE_FORMAT_BLOCK_SIZE: Record<string, number> = {
    'bc1-rgba-unorm':  8,
    'bc1-rgba-unorm-srgb':  8,
    'bc2-rgba-unorm':  16,
    'bc2-rgba-unorm-srgb':  16,
    'bc3-rgba-unorm':  16,
    'bc3-rgba-unorm-srgb':  16,
    'bc4-r-unorm':  8,
    'bc4-r-snorm':  8,
    'bc5-rg-unorm':  16,
    'bc5-rg-snorm':  16,
    'bc6h-rgb-ufloat':  16,
    'bc6h-rgb-float':  16,
    'bc7-rgba-unorm':  16,
    'bc7-rgba-unorm-srgb':  16
};
