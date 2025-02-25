/**
 * WebGL internal formats, including compressed texture formats provided by extensions
 * @memberof PIXI
 * @static
 * @name INTERNAL_FORMATS
 * @enum {number}
 */
export enum INTERNAL_FORMATS
// eslint-disable-next-line @typescript-eslint/indent
{
    // WEBGL_compressed_texture_s3tc
    /**
     * @default 0x83F0
     */
    COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0,
    /**
     * @default 0x83F1
     */
    COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1,
    /**
     * @default 0x83F2
     */
    COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2,
    /**
     * @default 0x83F3
     */
    COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3,

    // WEBGL_compressed_texture_s3tc_srgb
    /**
     * @default 35917
     */
    COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 35917,
    /**
     * @default 35918
     */
    COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 35918,
    /**
     * @default 35919
     */
    COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 35919,
    /**
     * @default 35916
     */
    COMPRESSED_SRGB_S3TC_DXT1_EXT = 35916,

    // WEBGL_compressed_texture_etc
    /**
     * @default 0x9270
     */
    COMPRESSED_R11_EAC = 0x9270,
    /**
     * @default 0x9271
     */
    COMPRESSED_SIGNED_R11_EAC = 0x9271,
    /**
     * @default 0x9272
     */
    COMPRESSED_RG11_EAC = 0x9272,
    /**
     * @default 0x9273
     */
    COMPRESSED_SIGNED_RG11_EAC = 0x9273,
    /**
     * @default 0x9274
     */
    COMPRESSED_RGB8_ETC2 = 0x9274,
    /**
     * @default 0x9278
     */
    COMPRESSED_RGBA8_ETC2_EAC = 0x9278,
    /**
     * @default 0x9275
     */
    COMPRESSED_SRGB8_ETC2 = 0x9275,
    /**
     * @default 0x9279
     */
    COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = 0x9279,
    /**
     * @default 0x9276
     */
    COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 0x9276,
    /**
     * @default 0x9277
     */
    COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 0x9277,

    // WEBGL_compressed_texture_pvrtc
    /**
     * @default 0x8C00
     */
    COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00,
    /**
     * @default 0x8C02
     */
    COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02,
    /**
     * @default 0x8C01
     */
    COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01,
    /**
     * @default 0x8C03
     */
    COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03,

    // WEBGL_compressed_texture_etc1
    /**
     * @default 0x8D64
     */
    COMPRESSED_RGB_ETC1_WEBGL = 0x8D64,

    // WEBGL_compressed_texture_atc
    /**
     * @default 0x8C92
     */
    COMPRESSED_RGB_ATC_WEBGL = 0x8C92,
    /**
     * @default 0x8C93
     */
    COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 0x8C93,
    /**
     * @default 0x87EE
     */
    COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 0x87EE,

    // WEBGL_compressed_texture_astc
    /* eslint-disable-next-line camelcase */
    /**
     * @default 0x93B0
     */
    COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0,
    /**
     * @default 0x93B1
     */
    COMPRESSED_RGBA_ASTC_5x4_KHR = 0x93B1,
    /**
     * @default 0x93B2
     */
    COMPRESSED_RGBA_ASTC_5x5_KHR = 0x93B2,
    /**
     * @default 0x93B3
     */
    COMPRESSED_RGBA_ASTC_6x5_KHR = 0x93B3,
    /**
     * @default 0x93B4
     */
    COMPRESSED_RGBA_ASTC_6x6_KHR = 0x93B4,
    /**
     * @default 0x93B5
     */
    COMPRESSED_RGBA_ASTC_8x5_KHR = 0x93B5,
    /**
     * @default 0x93B6
     */
    COMPRESSED_RGBA_ASTC_8x6_KHR = 0x93B6,
    /**
     * @default 0x93B7
     */
    COMPRESSED_RGBA_ASTC_8x8_KHR = 0x93B7,
    /**
     * @default 0x93B8
     */
    COMPRESSED_RGBA_ASTC_10x5_KHR = 0x93B8,
    /**
     * @default 0x93B9
     */
    COMPRESSED_RGBA_ASTC_10x6_KHR = 0x93B9,
    /**
     * @default 0x93BA
     */
    COMPRESSED_RGBA_ASTC_10x8_KHR = 0x93BA,
    /**
     * @default 0x93BB
     */
    COMPRESSED_RGBA_ASTC_10x10_KHR = 0x93BB,
    /**
     * @default 0x93BC
     */
    COMPRESSED_RGBA_ASTC_12x10_KHR = 0x93BC,
    /**
     * @default 0x93BD
     */
    COMPRESSED_RGBA_ASTC_12x12_KHR = 0x93BD,
    // EXT_texture_compression_bptc
    /**
     * @default 0x8E8C
     */
    COMPRESSED_RGBA_BPTC_UNORM_EXT = 0x8E8C,
    /**
     * @default 0x8E8D
     */
    COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT = 0x8E8D,
    /**
     * @default 0x8E8E
     */
    COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT = 0x8E8E,
    /**
     * @default 0x8E8F
     */
    COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT = 0x8E8F
}

/**
 * Maps the compressed texture formats in {@link PIXI.INTERNAL_FORMATS} to the number of bytes taken by
 * each texel.
 * @memberof PIXI
 * @static
 * @ignore
 */
export const INTERNAL_FORMAT_TO_BYTES_PER_PIXEL: { [id: number]: number } = {
    // WEBGL_compressed_texture_s3tc
    [INTERNAL_FORMATS.COMPRESSED_RGB_S3TC_DXT1_EXT]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT]: 1,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT]: 1,

    // WEBGL_compressed_texture_s3tc
    [INTERNAL_FORMATS.COMPRESSED_SRGB_S3TC_DXT1_EXT]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT]: 1,
    [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT]: 1,

    // WEBGL_compressed_texture_etc
    [INTERNAL_FORMATS.COMPRESSED_R11_EAC]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_SIGNED_R11_EAC]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RG11_EAC]: 1,
    [INTERNAL_FORMATS.COMPRESSED_SIGNED_RG11_EAC]: 1,
    [INTERNAL_FORMATS.COMPRESSED_RGB8_ETC2]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGBA8_ETC2_EAC]: 1,
    [INTERNAL_FORMATS.COMPRESSED_SRGB8_ETC2]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC]: 1,
    [INTERNAL_FORMATS.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2]: 0.5, // ~~
    [INTERNAL_FORMATS.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2]: 0.5, // ~~

    // WEBGL_compressed_texture_pvrtc
    [INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_4BPPV1_IMG]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_2BPPV1_IMG]: 0.25,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG]: 0.25,

    // WEBGL_compressed_texture_etc1
    [INTERNAL_FORMATS.COMPRESSED_RGB_ETC1_WEBGL]: 0.5,

    // @see https://www.khronos.org/registry/OpenGL/extensions/AMD/AMD_compressed_ATC_texture.txt
    // WEBGL_compressed_texture_atc
    [INTERNAL_FORMATS.COMPRESSED_RGB_ATC_WEBGL]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL]: 1,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL]: 1,

    // @see https://registry.khronos.org/OpenGL/extensions/KHR/KHR_texture_compression_astc_hdr.txt
    // WEBGL_compressed_texture_astc
    /* eslint-disable-next-line camelcase */
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_4x4_KHR]: 1, // 16 bytes per 4x4 block = 1 byte per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_5x4_KHR]: 0.8, // 16 bytes per 5x4 block = 0.8 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_5x5_KHR]: 0.64, // 16 bytes per 5x5 block = 0.64 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_6x5_KHR]: 0.533, // 16 bytes per 6x5 block ≈ 0.533 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_6x6_KHR]: 0.444, // 16 bytes per 6x6 block ≈ 0.444 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_8x5_KHR]: 0.32, // 16 bytes per 8x5 block ≈ 0.32 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_8x6_KHR]: 0.333, // 16 bytes per 8x6 block ≈ 0.333 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_8x8_KHR]: 0.25, // 16 bytes per 8x8 block = 0.25 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_10x5_KHR]: 0.32, // 16 bytes per 10x5 block = 0.32 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_10x6_KHR]: 0.267, // 16 bytes per 10x6 block ≈ 0.267 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_10x8_KHR]: 0.2, // 16 bytes per 10x8 block = 0.2 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_10x10_KHR]: 0.16, // 16 bytes per 10x10 block = 0.16 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_12x10_KHR]: 0.133, // 16 bytes per 12x10 block ≈ 0.133 bytes per pixel
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_12x12_KHR]: 0.111, // 16 bytes per 12x12 block ≈ 0.111 bytes per pixel

    // @see https://registry.khronos.org/OpenGL/extensions/EXT/EXT_texture_compression_bptc.txt
    // EXT_texture_compression_bptc
    [INTERNAL_FORMATS.COMPRESSED_RGBA_BPTC_UNORM_EXT]: 1,
    [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT]: 1,
    [INTERNAL_FORMATS.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT]: 1,
    [INTERNAL_FORMATS.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT]: 1,
};
