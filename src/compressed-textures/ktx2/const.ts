import type { TEXTURE_FORMATS } from '../../rendering/renderers/shared/texture/const';

export enum GL_INTERNAL_FORMAT
// eslint-disable-next-line @typescript-eslint/indent
{
    RGBA8_SNORM = 0x8F97,
    RGBA = 0x1908,
    RGBA8UI = 0x8D7C,
    SRGB8_ALPHA8 = 0x8C43,
    RGBA8I = 0x8D8E,
    RGBA8 = 0x8058,

    COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0,
    COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1,
    COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2,
    COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 35917,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 35918,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 35919,
    COMPRESSED_SRGB_S3TC_DXT1_EXT = 35916,

    COMPRESSED_RED_RGTC1_EXT = 0x8DBB,
    COMPRESSED_SIGNED_RED_RGTC1_EXT = 0x8DBC,
    COMPRESSED_RED_GREEN_RGTC2_EXT = 0x8DBD,
    COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT = 0x8DBE,

    COMPRESSED_R11_EAC = 0x9270,
    COMPRESSED_SIGNED_R11_EAC = 0x9271,
    COMPRESSED_RG11_EAC = 0x9272,
    COMPRESSED_SIGNED_RG11_EAC = 0x9273,
    COMPRESSED_RGB8_ETC2 = 0x9274,
    COMPRESSED_RGBA8_ETC2_EAC = 0x9278,
    COMPRESSED_SRGB8_ETC2 = 0x9275,
    COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = 0x9279,
    COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 0x9276,
    COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 0x9277,

    COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0,
    COMPRESSED_RGBA_ASTC_5x4_KHR = 0x93B1,
    COMPRESSED_RGBA_ASTC_5x5_KHR = 0x93B2,
    COMPRESSED_RGBA_ASTC_6x5_KHR = 0x93B3,
    COMPRESSED_RGBA_ASTC_6x6_KHR = 0x93B4,
    COMPRESSED_RGBA_ASTC_8x5_KHR = 0x93B5,
    COMPRESSED_RGBA_ASTC_8x6_KHR = 0x93B6,
    COMPRESSED_RGBA_ASTC_8x8_KHR = 0x93B7,
    COMPRESSED_RGBA_ASTC_10x5_KHR = 0x93B8,
    COMPRESSED_RGBA_ASTC_10x6_KHR = 0x93B9,
    COMPRESSED_RGBA_ASTC_10x8_KHR = 0x93BA,
    COMPRESSED_RGBA_ASTC_10x10_KHR = 0x93BB,
    COMPRESSED_RGBA_ASTC_12x10_KHR = 0x93BC,
    COMPRESSED_RGBA_ASTC_12x12_KHR = 0x93BD,
    COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 0x93D0,
    COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR = 0x93D1,
    COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR = 0x93D2,
    COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR = 0x93D3,
    COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR = 0x93D4,
    COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR = 0x93D5,
    COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR = 0x93D6,
    COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR = 0x93D7,
    COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR = 0x93D8,
    COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR = 0x93D9,
    COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR = 0x93DA,
    COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR = 0x93DB,
    COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR = 0x93DC,
    COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR = 0x93DD,

    COMPRESSED_RGBA_BPTC_UNORM_EXT = 0x8E8C,
    COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT = 0x8E8D,
    COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT = 0x8E8E,
    COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT = 0x8E8F
}

enum GL_FORMATS
// eslint-disable-next-line @typescript-eslint/indent
{
    RGBA = 6408,
    RGB = 6407,
    RG = 33319,
    RED = 6403,
    RGBA_INTEGER = 36249,
    RGB_INTEGER = 36248,
    RG_INTEGER = 33320,
    RED_INTEGER = 36244,
    ALPHA = 6406,
    LUMINANCE = 6409,
    LUMINANCE_ALPHA = 6410,
    DEPTH_COMPONENT = 6402,
    DEPTH_STENCIL = 34041,
}

enum GL_TYPES
// eslint-disable-next-line @typescript-eslint/indent
{
    UNSIGNED_BYTE = 5121,
    UNSIGNED_SHORT = 5123,
    UNSIGNED_SHORT_5_6_5 = 33635,
    UNSIGNED_SHORT_4_4_4_4 = 32819,
    UNSIGNED_SHORT_5_5_5_1 = 32820,
    UNSIGNED_INT = 5125,
    UNSIGNED_INT_10F_11F_11F_REV = 35899,
    UNSIGNED_INT_2_10_10_10_REV = 33640,
    UNSIGNED_INT_24_8 = 34042,
    UNSIGNED_INT_5_9_9_9_REV = 35902,
    BYTE = 5120,
    SHORT = 5122,
    INT = 5124,
    FLOAT = 5126,
    FLOAT_32_UNSIGNED_INT_24_8_REV = 36269,
    HALF_FLOAT = 36193,
}

const INTERNAL_FORMAT_TO_TEXTURE_FORMATS: { [id: number]: TEXTURE_FORMATS } = {

    [GL_INTERNAL_FORMAT.COMPRESSED_RGB_S3TC_DXT1_EXT]: 'bc1-rgba-unorm', // TODO: ???
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_S3TC_DXT1_EXT]: 'bc1-rgba-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_S3TC_DXT3_EXT]: 'bc2-rgba-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_S3TC_DXT5_EXT]: 'bc3-rgba-unorm',

    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB_S3TC_DXT1_EXT]: 'bc1-rgba-unorm-srgb', // TODO: ???
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT]: 'bc1-rgba-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT]: 'bc2-rgba-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT]: 'bc3-rgba-unorm-srgb',

    [GL_INTERNAL_FORMAT.COMPRESSED_RED_RGTC1_EXT]: 'bc4-r-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SIGNED_RED_RGTC1_EXT]: 'bc4-r-snorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_RED_GREEN_RGTC2_EXT]: 'bc5-rg-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT]: 'bc5-rg-snorm',

    [GL_INTERNAL_FORMAT.COMPRESSED_R11_EAC]: 'eac-r11unorm',
    // [GL_INTERNAL_FORMAT.COMPRESSED_SIGNED_R11_EAC]: 'eac-r11snorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_RG11_EAC]: 'eac-rg11snorm',
    // [GL_INTERNAL_FORMAT.COMPRESSED_SIGNED_RG11_EAC]: 'eac-rg11unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGB8_ETC2]: 'etc2-rgb8unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA8_ETC2_EAC]: 'etc2-rgba8unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ETC2]: 'etc2-rgb8unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC]: 'etc2-rgba8unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2]: 'etc2-rgb8a1unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2]: 'etc2-rgb8a1unorm-srgb',

    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_4x4_KHR]: 'astc-4x4-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR]: 'astc-4x4-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_5x4_KHR]: 'astc-5x4-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR]: 'astc-5x4-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_5x5_KHR]: 'astc-5x5-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR]: 'astc-5x5-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_6x5_KHR]: 'astc-6x5-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR]: 'astc-6x5-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_6x6_KHR]: 'astc-6x6-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR]: 'astc-6x6-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_8x5_KHR]: 'astc-8x5-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR]: 'astc-8x5-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_8x6_KHR]: 'astc-8x6-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR]: 'astc-8x6-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_8x8_KHR]: 'astc-8x8-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR]: 'astc-8x8-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_10x5_KHR]: 'astc-10x5-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR]: 'astc-10x5-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_10x6_KHR]: 'astc-10x6-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR]: 'astc-10x6-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_10x8_KHR]: 'astc-10x8-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR]: 'astc-10x8-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_10x10_KHR]: 'astc-10x10-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR]: 'astc-10x10-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_12x10_KHR]: 'astc-12x10-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR]: 'astc-12x10-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_12x12_KHR]: 'astc-12x12-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR]: 'astc-12x12-unorm-srgb',

    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_BPTC_UNORM_EXT]: 'bc7-rgba-unorm',
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT]: 'bc7-rgba-unorm-srgb',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT]: 'bc6h-rgb-float',
    [GL_INTERNAL_FORMAT.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT]: 'bc6h-rgb-ufloat',

    [GL_INTERNAL_FORMAT.SRGB8_ALPHA8]: 'rgba8unorm-srgb',

    [GL_INTERNAL_FORMAT.RGBA8_SNORM]: 'rgba8snorm',
    [GL_INTERNAL_FORMAT.RGBA8UI]: 'rgba8uint',
    [GL_INTERNAL_FORMAT.RGBA8I]: 'rgba8sint',
    [GL_INTERNAL_FORMAT.RGBA]: 'rgba8unorm',
    // [GL_INTERNAL_FORMAT.RGBA8]: 'bgra8unorm'
};

/**
 * The 12-byte KTX file identifier
 * @see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/#2.1
 * @ignore
 */
const FILE_IDENTIFIER = [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A];

/**
 * The value stored in the "endianness" field.
 * @see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/#2.2
 * @ignore
 */

const FIELDS = {
    FILE_IDENTIFIER: 0,
    ENDIANNESS: 12,
    GL_TYPE: 16,
    GL_TYPE_SIZE: 20,
    GL_FORMAT: 24,
    GL_INTERNAL_FORMAT: 28,
    GL_BASE_INTERNAL_FORMAT: 32,
    PIXEL_WIDTH: 36,
    PIXEL_HEIGHT: 40,
    PIXEL_DEPTH: 44,
    NUMBER_OF_ARRAY_ELEMENTS: 48,
    NUMBER_OF_FACES: 52,
    NUMBER_OF_MIPMAP_LEVELS: 56,
    BYTES_OF_KEY_VALUE_DATA: 60,
};

const FILE_HEADER_SIZE = 64;
const ENDIANNESS = 0x04030201;

const TYPES_TO_BYTES_PER_COMPONENT: { [id: number]: number } = {
    [GL_TYPES.UNSIGNED_BYTE]: 1,
    [GL_TYPES.UNSIGNED_SHORT]: 2,
    [GL_TYPES.INT]: 4,
    [GL_TYPES.UNSIGNED_INT]: 4,
    [GL_TYPES.FLOAT]: 4,
    [GL_TYPES.HALF_FLOAT]: 8,
};

const FORMATS_TO_COMPONENTS: { [id: number]: number } = {
    [GL_FORMATS.RGBA]: 4,
    [GL_FORMATS.RGB]: 3,
    [GL_FORMATS.RG]: 2,
    [GL_FORMATS.RED]: 1,
    [GL_FORMATS.LUMINANCE]: 1,
    [GL_FORMATS.LUMINANCE_ALPHA]: 2,
    [GL_FORMATS.ALPHA]: 1,
};

const TYPES_TO_BYTES_PER_PIXEL: { [id: number]: number } = {
    [GL_TYPES.UNSIGNED_SHORT_4_4_4_4]: 2,
    [GL_TYPES.UNSIGNED_SHORT_5_5_5_1]: 2,
    [GL_TYPES.UNSIGNED_SHORT_5_6_5]: 2,
};

const INTERNAL_FORMAT_TO_BYTES_PER_PIXEL: { [id: number]: number } = {
    [GL_INTERNAL_FORMAT.COMPRESSED_RGB_S3TC_DXT1_EXT]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_S3TC_DXT1_EXT]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_S3TC_DXT3_EXT]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_S3TC_DXT5_EXT]: 1,

    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB_S3TC_DXT1_EXT]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT]: 1,

    [GL_INTERNAL_FORMAT.COMPRESSED_RED_RGTC1_EXT]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_SIGNED_RED_RGTC1_EXT]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_RED_GREEN_RGTC2_EXT]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT]: 1,

    [GL_INTERNAL_FORMAT.COMPRESSED_R11_EAC]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_SIGNED_R11_EAC]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_RG11_EAC]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_SIGNED_RG11_EAC]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGB8_ETC2]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA8_ETC2_EAC]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ETC2]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2]: 0.5,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2]: 0.5,

    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_4x4_KHR]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_5x4_KHR]: 0.8,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR]: 0.8,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_5x5_KHR]: 0.64,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR]: 0.64,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_6x5_KHR]: 0.53375,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR]: 0.53375,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_6x6_KHR]: 0.445,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR]: 0.445,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_8x5_KHR]: 0.4,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR]: 0.4,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_8x6_KHR]: 0.33375,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR]: 0.33375,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_8x8_KHR]: 0.25,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR]: 0.25,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_10x5_KHR]: 0.32,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR]: 0.32,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_10x6_KHR]: 0.26625,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR]: 0.26625,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_10x8_KHR]: 0.2,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR]: 0.2,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_10x10_KHR]: 0.16,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR]: 0.16,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_12x10_KHR]: 0.13375,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR]: 0.13375,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_ASTC_12x12_KHR]: 0.11125,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR]: 0.11125,

    [GL_INTERNAL_FORMAT.COMPRESSED_RGBA_BPTC_UNORM_EXT]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT]: 1,
    [GL_INTERNAL_FORMAT.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT]: 1,
};

export const KTX = {
    FILE_HEADER_SIZE,
    FILE_IDENTIFIER,
    FORMATS_TO_COMPONENTS,
    INTERNAL_FORMAT_TO_BYTES_PER_PIXEL,
    INTERNAL_FORMAT_TO_TEXTURE_FORMATS,
    FIELDS,
    TYPES_TO_BYTES_PER_COMPONENT,
    TYPES_TO_BYTES_PER_PIXEL,
    ENDIANNESS
};