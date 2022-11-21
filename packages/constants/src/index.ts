/**
 * Different types of environments for WebGL.
 * @static
 * @memberof PIXI
 * @name ENV
 * @enum {number}
 * @property {number} WEBGL_LEGACY - Used for older v1 WebGL devices. PixiJS will aim to ensure compatibility
 *  with older / less advanced devices. If you experience unexplained flickering prefer this environment.
 * @property {number} WEBGL - Version 1 of WebGL
 * @property {number} WEBGL2 - Version 2 of WebGL
 */
export enum ENV
// eslint-disable-next-line @typescript-eslint/indent
{
    WEBGL_LEGACY,
    WEBGL,
    WEBGL2,
}

/**
 * Constant to identify the Renderer Type.
 * @static
 * @memberof PIXI
 * @name RENDERER_TYPE
 * @enum {number}
 * @property {number} UNKNOWN - Unknown render type.
 * @property {number} WEBGL - WebGL render type.
 * @property {number} CANVAS - Canvas render type.
 */
export enum RENDERER_TYPE
// eslint-disable-next-line @typescript-eslint/indent
{
    UNKNOWN,
    WEBGL,
    CANVAS,
}

/**
 * Bitwise OR of masks that indicate the buffers to be cleared.
 * @static
 * @memberof PIXI
 * @name BUFFER_BITS
 * @enum {number}
 * @property {number} COLOR - Indicates the buffers currently enabled for color writing.
 * @property {number} DEPTH - Indicates the depth buffer.
 * @property {number} STENCIL - Indicates the stencil buffer.
 */
export enum BUFFER_BITS
// eslint-disable-next-line @typescript-eslint/indent
{
    COLOR = 0x00004000,
    DEPTH = 0x00000100,
    STENCIL = 0x00000400
}

/**
 * Various blend modes supported by PIXI.
 *
 * IMPORTANT - The WebGL renderer only supports the NORMAL, ADD, MULTIPLY and SCREEN blend modes.
 * Anything else will silently act like NORMAL.
 * @memberof PIXI
 * @name BLEND_MODES
 * @enum {number}
 * @property {number} NORMAL -
 * @property {number} ADD -
 * @property {number} MULTIPLY -
 * @property {number} SCREEN -
 * @property {number} OVERLAY -
 * @property {number} DARKEN -
 * @property {number} LIGHTEN -
 * @property {number} COLOR_DODGE -
 * @property {number} COLOR_BURN -
 * @property {number} HARD_LIGHT -
 * @property {number} SOFT_LIGHT -
 * @property {number} DIFFERENCE -
 * @property {number} EXCLUSION -
 * @property {number} HUE -
 * @property {number} SATURATION -
 * @property {number} COLOR -
 * @property {number} LUMINOSITY -
 * @property {number} NORMAL_NPM -
 * @property {number} ADD_NPM -
 * @property {number} SCREEN_NPM -
 * @property {number} NONE -
 * @property {number} SRC_IN -
 * @property {number} SRC_OUT -
 * @property {number} SRC_ATOP -
 * @property {number} DST_OVER -
 * @property {number} DST_IN -
 * @property {number} DST_OUT -
 * @property {number} DST_ATOP -
 * @property {number} SUBTRACT -
 * @property {number} SRC_OVER -
 * @property {number} ERASE -
 * @property {number} XOR -
 */
export enum BLEND_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    NORMAL = 0,
    ADD = 1,
    MULTIPLY = 2,
    SCREEN = 3,
    OVERLAY = 4,
    DARKEN = 5,
    LIGHTEN = 6,
    COLOR_DODGE = 7,
    COLOR_BURN = 8,
    HARD_LIGHT = 9,
    SOFT_LIGHT = 10,
    DIFFERENCE = 11,
    EXCLUSION = 12,
    HUE = 13,
    SATURATION = 14,
    COLOR = 15,
    LUMINOSITY = 16,
    NORMAL_NPM = 17,
    ADD_NPM = 18,
    SCREEN_NPM = 19,
    NONE = 20,

    SRC_OVER = 0,
    SRC_IN = 21,
    SRC_OUT = 22,
    SRC_ATOP = 23,
    DST_OVER = 24,
    DST_IN = 25,
    DST_OUT = 26,
    DST_ATOP = 27,
    ERASE = 26,
    SUBTRACT = 28,
    XOR = 29,
}

/**
 * Various webgl draw modes. These can be used to specify which GL drawMode to use
 * under certain situations and renderers.
 * @memberof PIXI
 * @static
 * @name DRAW_MODES
 * @enum {number}
 * @property {number} POINTS -
 * @property {number} LINES -
 * @property {number} LINE_LOOP -
 * @property {number} LINE_STRIP -
 * @property {number} TRIANGLES -
 * @property {number} TRIANGLE_STRIP -
 * @property {number} TRIANGLE_FAN -
 */
export enum DRAW_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    POINTS,
    LINES,
    LINE_LOOP,
    LINE_STRIP,
    TRIANGLES,
    TRIANGLE_STRIP,
    TRIANGLE_FAN,
}

/**
 * Various GL texture/resources formats.
 * @memberof PIXI
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
export enum FORMATS
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

/**
 * Various GL target types.
 * @memberof PIXI
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
export enum TARGETS
// eslint-disable-next-line @typescript-eslint/indent
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
 * Various GL data format types.
 * @memberof PIXI
 * @static
 * @name TYPES
 * @enum {number}
 * @property {number} [UNSIGNED_BYTE=5121] -
 * @property {number} [UNSIGNED_SHORT=5123] -
 * @property {number} [UNSIGNED_SHORT_5_6_5=33635] -
 * @property {number} [UNSIGNED_SHORT_4_4_4_4=32819] -
 * @property {number} [UNSIGNED_SHORT_5_5_5_1=32820] -
 * @property {number} [UNSIGNED_INT=5125] -
 * @property {number} [UNSIGNED_INT_10F_11F_11F_REV=35899] -
 * @property {number} [UNSIGNED_INT_2_10_10_10_REV=33640] -
 * @property {number} [UNSIGNED_INT_24_8=34042] -
 * @property {number} [UNSIGNED_INT_5_9_9_9_REV=35902] -
 * @property {number} [BYTE=5120] -
 * @property {number} [SHORT=5122] -
 * @property {number} [INT=5124] -
 * @property {number} [FLOAT=5126] -
 * @property {number} [FLOAT_32_UNSIGNED_INT_24_8_REV=36269] -
 * @property {number} [HALF_FLOAT=36193] -
 */
export enum TYPES
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

/**
 * Various sampler types. Correspond to `sampler`, `isampler`, `usampler` GLSL types respectively.
 * WebGL1 works only with FLOAT.
 * @memberof PIXI
 * @static
 * @name SAMPLER_TYPES
 * @enum {number}
 * @property {number} [FLOAT=0] -
 * @property {number} [INT=1] -
 * @property {number} [UINT=2] -
 */
export enum SAMPLER_TYPES
// eslint-disable-next-line @typescript-eslint/indent
{
    FLOAT = 0,
    INT = 1,
    UINT = 2,
}

/**
 * The scale modes that are supported by pixi.
 *
 * The {@link PIXI.settings.SCALE_MODE} scale mode affects the default scaling mode of future operations.
 * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
 * @memberof PIXI
 * @static
 * @name SCALE_MODES
 * @enum {number}
 * @property {number} LINEAR Smooth scaling
 * @property {number} NEAREST Pixelating scaling
 */
export enum SCALE_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    NEAREST,
    LINEAR,
}

/**
 * The wrap modes that are supported by pixi.
 *
 * The wrap mode affects the default wrapping mode of future operations.
 * It can be re-assigned to either CLAMP or REPEAT, depending upon suitability.
 * If the texture is non power of two then clamp will be used regardless as WebGL can
 * only use REPEAT if the texture is po2.
 *
 * This property only affects WebGL.
 * @name WRAP_MODES
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} CLAMP - The textures uvs are clamped
 * @property {number} REPEAT - The texture uvs tile and repeat
 * @property {number} MIRRORED_REPEAT - The texture uvs tile and repeat with mirroring
 */
export enum WRAP_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    CLAMP = 33071,
    REPEAT = 10497,
    MIRRORED_REPEAT = 33648,
}

/**
 * Mipmap filtering modes that are supported by pixi.
 *
 * The {@link PIXI.settings.MIPMAP_TEXTURES} affects default texture filtering.
 * Mipmaps are generated for a baseTexture if its `mipmap` field is `ON`,
 * or its `POW2` and texture dimensions are powers of 2.
 * Since WebGL 1 don't support mipmap for non-power-of-two textures,
 * `ON` option will work like `POW2` for WebGL 1.
 *
 * This property only affects WebGL.
 * @name MIPMAP_MODES
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} OFF - No mipmaps.
 * @property {number} POW2 - Generate mipmaps if texture dimensions are powers of 2.
 * @property {number} ON - Always generate mipmaps.
 * @property {number} ON_MANUAL - Use mipmaps, but do not auto-generate them;
 *  this is used with a resource that supports buffering each level-of-detail.
 */
export enum MIPMAP_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    OFF,
    POW2,
    ON,
    ON_MANUAL,
}

/**
 * How to treat textures with premultiplied alpha
 * @name ALPHA_MODES
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} NO_PREMULTIPLIED_ALPHA - Source is not premultiplied, leave it like that.
 *  Option for compressed and data textures that are created from typed arrays.
 * @property {number} PREMULTIPLY_ON_UPLOAD - Source is not premultiplied, premultiply on upload.
 *  Default option, used for all loaded images.
 * @property {number} PREMULTIPLIED_ALPHA - Source is already premultiplied
 *  Example: spine atlases with `_pma` suffix.
 * @property {number} NPM - Alias for NO_PREMULTIPLIED_ALPHA.
 * @property {number} UNPACK - Default option, alias for PREMULTIPLY_ON_UPLOAD.
 * @property {number} PMA - Alias for PREMULTIPLIED_ALPHA.
 */
export enum ALPHA_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    NPM = 0,
    UNPACK = 1,
    PMA = 2,
    NO_PREMULTIPLIED_ALPHA = 0,
    PREMULTIPLY_ON_UPLOAD = 1,
    PREMULTIPLIED_ALPHA = 2,
}

/**
 * Configure whether filter textures are cleared after binding.
 *
 * Filter textures need not be cleared if the filter does not use pixel blending. {@link CLEAR_MODES.BLIT} will detect
 * this and skip clearing as an optimization.
 * @name CLEAR_MODES
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} BLEND - Do not clear the filter texture. The filter's output will blend on top of the output texture.
 * @property {number} CLEAR - Always clear the filter texture.
 * @property {number} BLIT - Clear only if {@link FilterSystem.forceClear} is set or if the filter uses pixel blending.
 * @property {number} NO - Alias for BLEND, same as `false` in earlier versions
 * @property {number} YES - Alias for CLEAR, same as `true` in earlier versions
 * @property {number} AUTO - Alias for BLIT
 */
export enum CLEAR_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    NO = 0,
    YES = 1,
    AUTO = 2,
    BLEND = 0,
    CLEAR = 1,
    BLIT = 2,
}

/**
 * The gc modes that are supported by pixi.
 *
 * The {@link PIXI.settings.GC_MODE} Garbage Collection mode for PixiJS textures is AUTO
 * If set to GC_MODE, the renderer will occasionally check textures usage. If they are not
 * used for a specified period of time they will be removed from the GPU. They will of course
 * be uploaded again when they are required. This is a silent behind the scenes process that
 * should ensure that the GPU does not  get filled up.
 *
 * Handy for mobile devices!
 * This property only affects WebGL.
 * @name GC_MODES
 * @enum {number}
 * @static
 * @memberof PIXI
 * @property {number} AUTO - Garbage collection will happen periodically automatically
 * @property {number} MANUAL - Garbage collection will need to be called manually
 */
export enum GC_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    AUTO,
    MANUAL,
}

/**
 * Constants that specify float precision in shaders.
 * @name PRECISION
 * @memberof PIXI
 * @constant
 * @static
 * @enum {string}
 * @property {string} [LOW='lowp'] -
 * @property {string} [MEDIUM='mediump'] -
 * @property {string} [HIGH='highp'] -
 */
export enum PRECISION
// eslint-disable-next-line @typescript-eslint/indent
{
    LOW = 'lowp',
    MEDIUM = 'mediump',
    HIGH = 'highp',
}

/**
 * Constants for mask implementations.
 * We use `type` suffix because it leads to very different behaviours
 * @name MASK_TYPES
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} NONE - Mask is ignored
 * @property {number} SCISSOR - Scissor mask, rectangle on screen, cheap
 * @property {number} STENCIL - Stencil mask, 1-bit, medium, works only if renderer supports stencil
 * @property {number} SPRITE - Mask that uses SpriteMaskFilter, uses temporary RenderTexture
 * @property {number} COLOR - Color mask (RGBA)
 */
export enum MASK_TYPES
// eslint-disable-next-line @typescript-eslint/indent
{
    NONE = 0,
    SCISSOR = 1,
    STENCIL = 2,
    SPRITE = 3,
    COLOR = 4,
}

/**
 * Bitwise OR of masks that indicate the color channels that are rendered to.
 * @static
 * @memberof PIXI
 * @name COLOR_MASK_BITS
 * @enum {number}
 * @property {number} RED - Red channel.
 * @property {number} GREEN - Green channel
 * @property {number} BLUE - Blue channel.
 * @property {number} ALPHA - Alpha channel.
 */
export enum COLOR_MASK_BITS
// eslint-disable-next-line @typescript-eslint/indent
{
    RED = 0x1,
    GREEN = 0x2,
    BLUE = 0x4,
    ALPHA = 0x8
}

/**
 * Constants for multi-sampling antialiasing.
 * @see PIXI.Framebuffer#multisample
 * @name MSAA_QUALITY
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} NONE - No multisampling for this renderTexture
 * @property {number} LOW - Try 2 samples
 * @property {number} MEDIUM - Try 4 samples
 * @property {number} HIGH - Try 8 samples
 */
export enum MSAA_QUALITY
// eslint-disable-next-line @typescript-eslint/indent
{
    NONE = 0,
    LOW = 2,
    MEDIUM = 4,
    HIGH = 8
}

/**
 * Constants for various buffer types in Pixi
 * @see PIXI.BUFFER_TYPE
 * @name BUFFER_TYPE
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} ELEMENT_ARRAY_BUFFER - buffer type for using as an index buffer
 * @property {number} ARRAY_BUFFER - buffer type for using attribute data
 * @property {number} UNIFORM_BUFFER - the buffer type is for uniform buffer objects
 */
export enum BUFFER_TYPE
// eslint-disable-next-line @typescript-eslint/indent
{
    ELEMENT_ARRAY_BUFFER = 34963,
    ARRAY_BUFFER = 34962,
    // NOT YET SUPPORTED
    UNIFORM_BUFFER = 35345,
}
