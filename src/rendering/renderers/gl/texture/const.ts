/**
 * Various GL texture/resources formats.
 * @static
 * @name FORMATS
 * @enum {number}
 * @property {number} [RGBA=6408] -
 * @property {number} [RGB=6407] -
 * @property {number} [RG=33319] -
 * @property {number} [RED=6403] -
 * @property {number} [RGBA_INTEGER=36249] -
 * @property {number} [RGB_INTEGER=36248] -
 * @property {number} [RG_INTEGER=33320] -
 * @property {number} [RED_INTEGER=36244] -
 * @property {number} [ALPHA=6406] -
 * @property {number} [LUMINANCE=6409] -
 * @property {number} [LUMINANCE_ALPHA=6410] -
 * @property {number} [DEPTH_COMPONENT=6402] -
 * @property {number} [DEPTH_STENCIL=34041] -
 */
export enum GL_FORMATS
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

/**
 * Various GL target types.
 * @static
 * @name TARGETS
 * @enum {number}
 * @property {number} [TEXTURE_2D=3553] -
 * @property {number} [TEXTURE_CUBE_MAP=34067] -
 * @property {number} [TEXTURE_2D_ARRAY=35866] -
 * @property {number} [TEXTURE_CUBE_MAP_POSITIVE_X=34069] -
 * @property {number} [TEXTURE_CUBE_MAP_NEGATIVE_X=34070] -
 * @property {number} [TEXTURE_CUBE_MAP_POSITIVE_Y=34071] -
 * @property {number} [TEXTURE_CUBE_MAP_NEGATIVE_Y=34072] -
 * @property {number} [TEXTURE_CUBE_MAP_POSITIVE_Z=34073] -
 * @property {number} [TEXTURE_CUBE_MAP_NEGATIVE_Z=34074] -
 */
export enum GL_TARGETS
{
    TEXTURE_2D = 3553,
    TEXTURE_CUBE_MAP = 34067,
    TEXTURE_2D_ARRAY = 35866,
    TEXTURE_CUBE_MAP_POSITIVE_X = 34069,
    TEXTURE_CUBE_MAP_NEGATIVE_X = 34070,
    TEXTURE_CUBE_MAP_POSITIVE_Y = 34071,
    TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072,
    TEXTURE_CUBE_MAP_POSITIVE_Z = 34073,
    TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074,
}

/**
 * The wrap modes that are supported by pixi.
 *
 * The {@link settings.WRAP_MODE} wrap mode affects the default wrapping mode of future operations.
 * It can be re-assigned to either CLAMP or REPEAT, depending upon suitability.
 * If the texture is non power of two then clamp will be used regardless as WebGL can
 * only use REPEAT if the texture is po2.
 *
 * This property only affects WebGL.
 * @name WRAP_MODES
 * @static
 * @enum {number}
 * @property {number} CLAMP - The textures uvs are clamped
 * @property {number} REPEAT - The texture uvs tile and repeat
 * @property {number} MIRRORED_REPEAT - The texture uvs tile and repeat with mirroring
 */
export enum GL_WRAP_MODES
{
    CLAMP = 33071,
    REPEAT = 10497,
    MIRRORED_REPEAT = 33648,
}

export enum GL_TYPES
{
    /**
     * 8 bits per channel for gl.RGBA
     * @default 5121
     */
    UNSIGNED_BYTE = 5121,
    /**
     * @default 5123
     */
    UNSIGNED_SHORT = 5123,
    /**
     * 5 red bits, 6 green bits, 5 blue bits.
     * @default 33635
     */
    UNSIGNED_SHORT_5_6_5 = 33635,
    /**
     * 4 red bits, 4 green bits, 4 blue bits, 4 alpha bits.
     * @default 32819
     */
    UNSIGNED_SHORT_4_4_4_4 = 32819,
    /**
     * 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.
     * @default 32820
     */
    UNSIGNED_SHORT_5_5_5_1 = 32820,
    /**
     * @default 5125
     */
    UNSIGNED_INT = 5125,
    /**
     * @default 35899
     */
    UNSIGNED_INT_10F_11F_11F_REV = 35899,
    /**
     * @default 33640
     */
    UNSIGNED_INT_2_10_10_10_REV = 33640,
    /**
     * @default 34042
     */
    UNSIGNED_INT_24_8 = 34042,
    /**
     * @default 35902
     */
    UNSIGNED_INT_5_9_9_9_REV = 35902,
    /**
     * @default 5120
     */
    BYTE = 5120,
    /**
     * @default 5122
     */
    SHORT = 5122,
    /**
     * @default 5124
     */
    INT = 5124,
    /**
     * @default 5126
     */
    FLOAT = 5126,
    /**
     * @default 36269
     */
    FLOAT_32_UNSIGNED_INT_24_8_REV = 36269,
    /**
     * @default 36193
     */
    HALF_FLOAT = 36193,
}

