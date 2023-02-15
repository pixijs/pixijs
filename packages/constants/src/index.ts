/**
 * Different types of environments for WebGL.
 * @static
 * @memberof PIXI
 * @enum {number}
 */
export enum ENV
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * Used for older v1 WebGL devices. PixiJS will aim to ensure compatibility
     * with older / less advanced devices. If you experience unexplained flickering prefer this environment.
     * @default 0
     */
    WEBGL_LEGACY,
    /**
     * Version 1 of WebGL
     * @default 1
     */
    WEBGL,
    /**
     * Version 2 of WebGL
     * @default 2
     */
    WEBGL2,
}

/**
 * Constant to identify the Renderer Type.
 * @static
 * @memberof PIXI
 * @enum {number}
 */
export enum RENDERER_TYPE
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * Unknown render type.
     * @default 0
     */
    UNKNOWN,
    /**
     * WebGL render type.
     * @default 1
     */
    WEBGL,
    /**
     * Canvas render type.
     * @default 2
     */
    CANVAS,
}

/**
 * Bitwise OR of masks that indicate the buffers to be cleared.
 * @static
 * @memberof PIXI
 * @enum {number}
 */
export enum BUFFER_BITS
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * Indicates the buffers currently enabled for color writing.
     * @default 0x00004000
     */
    COLOR = 0x00004000,
    /**
     * Indicates the depth buffer.
     * @default 0x00000100
     */
    DEPTH = 0x00000100,
    /**
     * Indicates the stencil buffer.
     * @default 0x00000400
     */
    STENCIL = 0x00000400
}

/**
 * Various blend modes supported by PIXI.
 *
 * IMPORTANT - The WebGL renderer only supports the NORMAL, ADD, MULTIPLY and SCREEN blend modes.
 * Anything else will silently act like NORMAL.
 * @memberof PIXI
 * @enum {number}
 */
export enum BLEND_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * @default 0
     */
    NORMAL = 0,
    /**
     * @default 1
     */
    ADD = 1,
    /**
     * The pixels of the top layer are multiplied with the corresponding pixel of the bottom layer.
     * A darker picture is the result.
     * @default 2
     */
    MULTIPLY = 2,
    /**
     * The pixels are inverted, multiplied, and inverted again. A lighter picture is the result (opposite of multiply)
     * @default 3
     */
    SCREEN = 3,
    /**
     * A combination of multiply and screen. Dark parts on the base layer become darker, and light parts become lighter.
     *
     * Canvas Renderer only.
     * @default 4
     */
    OVERLAY = 4,
    /**
     * Retains the darkest pixels of both layers.
     *
     * Canvas Renderer only.
     * @default 5
     */
    DARKEN = 5,
    /**
     * Retains the lightest pixels of both layers.
     *
     * Canvas Renderer only.
     * @default 6
     */
    LIGHTEN = 6,
    /**
     * Divides the bottom layer by the inverted top layer.
     *
     * Canvas Renderer only.
     * @default 7
     */
    COLOR_DODGE = 7,
    /**
     * Divides the inverted bottom layer by the top layer, and then inverts the result.
     *
     * Canvas Renderer only.
     * @default 8
     */
    COLOR_BURN = 8,
    /**
     * A combination of multiply and screen like overlay, but with top and bottom layer swapped.
     *
     * Canvas Renderer only.
     * @default 9
     */
    HARD_LIGHT = 9,
    /**
     * A softer version of hard-light. Pure black or white does not result in pure black or white.
     *
     * Canvas Renderer only.
     * @default 10
     */
    SOFT_LIGHT = 10,
    /**
     * Subtracts the bottom layer from the top layer or the other way round to always get a positive value.
     *
     * Canvas Renderer only.
     * @default 11
     */
    DIFFERENCE = 11,
    /**
     * Like difference, but with lower contrast.
     *
     * Canvas Renderer only.
     * @default 12
     */
    EXCLUSION = 12,
    /**
     * Preserves the luma and chroma of the bottom layer, while adopting the hue of the top layer.
     *
     * Canvas Renderer only.
     * @default 13
     */
    HUE = 13,
    /**
     * Preserves the luma and hue of the bottom layer, while adopting the chroma of the top layer.
     *
     * Canvas Renderer only.
     * @default 14
     */
    SATURATION = 14,
    /**
     * Preserves the luma of the bottom layer, while adopting the hue and chroma of the top layer.
     *
     * Canvas Renderer only.
     * @default 15
     */
    COLOR = 15,
    /**
     * Preserves the hue and chroma of the bottom layer, while adopting the luma of the top layer.
     *
     * Canvas Renderer only.
     * @default 16
     */
    LUMINOSITY = 16,
    /**
     * @default 17
     */
    NORMAL_NPM = 17,
    /**
     * @default 18
     */
    ADD_NPM = 18,
    /**
     * @default 19
     */
    SCREEN_NPM = 19,
    /**
     * @default 20
     */
    NONE = 20,

    /**
     * Draws new shapes on top of the existing canvas content.
     * @default 0
     */
    SRC_OVER = 0,
    /**
     * The new shape is drawn only where both the new shape and the destination canvas overlap.
     * Everything else is made transparent.
     * @default 21
     */
    SRC_IN = 21,
    /**
     * The new shape is drawn where it doesn't overlap the existing canvas content.
     * @default 22
     */
    SRC_OUT = 22,
    /**
     * The new shape is only drawn where it overlaps the existing canvas content.
     * @default 23
     */
    SRC_ATOP = 23,
    /**
     * New shapes are drawn behind the existing canvas content.
     * @default 24
     */
    DST_OVER = 24,
    /**
     * The existing canvas content is kept where both the new shape and existing canvas content overlap.
     * Everything else is made transparent.
     * @default 25
     */
    DST_IN = 25,
    /**
     * The existing content is kept where it doesn't overlap the new shape.
     * @default 26
     */
    DST_OUT = 26,
    /**
     * The existing canvas is only kept where it overlaps the new shape. The new shape is drawn behind the canvas content.
     * @default 27
     */
    DST_ATOP = 27,
    /**
     * @default 26
     */
    ERASE = 26,
    /**
     * @default 28
     */
    SUBTRACT = 28,
    /**
     * Shapes are made transparent where both overlap and drawn normal everywhere else.
     * @default 29
     */
    XOR = 29,
}

/**
 * Various webgl draw modes. These can be used to specify which GL drawMode to use
 * under certain situations and renderers.
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum DRAW_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * To draw a series of points.
     * @default 0
     */
    POINTS,
    /**
     *  To draw a series of unconnected line segments (individual lines).
     * @default 1
     */
    LINES,
    /**
     *  To draw a series of connected line segments. It also joins the first and last vertices to form a loop.
     * @default 2
     */
    LINE_LOOP,
    /**
     * To draw a series of connected line segments.
     * @default 3
     */
    LINE_STRIP,
    /**
     * To draw a series of separate triangles.
     * @default 4
     */
    TRIANGLES,
    /**
     * To draw a series of connected triangles in strip fashion.
     * @default 5
     */
    TRIANGLE_STRIP,
    /**
     * To draw a series of connected triangles sharing the first vertex in a fan-like fashion.
     * @default 6
     */
    TRIANGLE_FAN,
}

/**
 * Various GL texture/resources formats.
 * @memberof PIXI
 * @static
 * @name FORMATS
 * @enum {number}
 */
export enum FORMATS
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * @default 6408
     */
    RGBA = 6408,
    /**
     * @default 6407
     */
    RGB = 6407,
    /**
     * @default 33319
     */
    RG = 33319,
    /**
     * @default 6403
     */
    RED = 6403,
    /**
     * @default 36249
     */
    RGBA_INTEGER = 36249,
    /**
     * @default 36248
     */
    RGB_INTEGER = 36248,
    /**
     * @default 33320
     */
    RG_INTEGER = 33320,
    /**
     * @default 36244
     */
    RED_INTEGER = 36244,
    /**
     * @default 6406
     */
    ALPHA = 6406,
    /**
     * @default 6409
     */
    LUMINANCE = 6409,
    /**
     * @default 6410
     */
    LUMINANCE_ALPHA = 6410,
    /**
     * @default 6402
     */
    DEPTH_COMPONENT = 6402,
    /**
     * @default 34041
     */
    DEPTH_STENCIL = 34041,
}

/**
 * Various GL target types.
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum TARGETS
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * A two-dimensional texture
     * @default 3553
     */
    TEXTURE_2D = 3553,
    /**
     * A cube-mapped texture. When using a WebGL 2 context, the following values are available additionally:
     * - gl.TEXTURE_3D: A three-dimensional texture.
     * - gl.TEXTURE_2D_ARRAY: A two-dimensional array texture.
     * @default 34067
     */
    TEXTURE_CUBE_MAP = 34067,
    /**
     * A two-dimensional array texture.
     * @default 35866
     */
    TEXTURE_2D_ARRAY = 35866,
    /**
     * Positive X face for a cube-mapped texture.
     * @default 34069
     */
    TEXTURE_CUBE_MAP_POSITIVE_X = 34069,
    /**
     * Negative X face for a cube-mapped texture.
     * @default 34070
     */
    TEXTURE_CUBE_MAP_NEGATIVE_X = 34070,
    /**
     * Positive Y face for a cube-mapped texture.
     * @default 34071
     */
    TEXTURE_CUBE_MAP_POSITIVE_Y = 34071,
    /**
     * Negative Y face for a cube-mapped texture.
     * @default 34072
     */
    TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072,
    /**
     * Positive Z face for a cube-mapped texture.
     * @default 34073
     */
    TEXTURE_CUBE_MAP_POSITIVE_Z = 34073,
    /**
     * Negative Z face for a cube-mapped texture.
     * @default 34074
     */
    TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074,
}

/**
 * Various GL data format types.
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum TYPES
// eslint-disable-next-line @typescript-eslint/indent
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

/**
 * Various sampler types. Correspond to `sampler`, `isampler`, `usampler` GLSL types respectively.
 * WebGL1 works only with FLOAT.
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum SAMPLER_TYPES
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * @default 0
     */
    FLOAT = 0,
    /**
     * @default 1
     */
    INT = 1,
    /**
     * @default 2
     */
    UINT = 2,
}

/**
 * The scale modes that are supported by pixi.
 *
 * The {@link PIXI.BaseTexture.defaultOptions.scaleMode} scale mode affects the default scaling mode of future operations.
 * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum SCALE_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * Pixelating scaling
     * @default 0
     */
    NEAREST,
    /**
     * Smooth scaling
     * @default 1
     */
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
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum WRAP_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * The textures uvs are clamped
     * @default 33071
     */
    CLAMP = 33071,
    /**
     * The texture uvs tile and repeat
     * @default 10497
     */
    REPEAT = 10497,
    /**
     * The texture uvs tile and repeat with mirroring
     * @default 33648
     */
    MIRRORED_REPEAT = 33648,
}

/**
 * Mipmap filtering modes that are supported by pixi.
 *
 * The {@link PIXI.BaseTexture.defaultOptions.mipmap} affects default texture filtering.
 * Mipmaps are generated for a baseTexture if its `mipmap` field is `ON`,
 * or its `POW2` and texture dimensions are powers of 2.
 * Since WebGL 1 don't support mipmap for non-power-of-two textures,
 * `ON` option will work like `POW2` for WebGL 1.
 *
 * This property only affects WebGL.
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum MIPMAP_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * No mipmaps.
     * @default 0
     */
    OFF,
    /**
     * Generate mipmaps if texture dimensions are powers of 2.
     * @default 1
     */
    POW2,
    /**
     * Always generate mipmaps.
     * @default 2
     */
    ON,
    /**
     * Use mipmaps, but do not auto-generate them.
     * this is used with a resource that supports buffering each level-of-detail.
     * @default 3
     */
    ON_MANUAL,
}

/**
 * How to treat textures with premultiplied alpha
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum ALPHA_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * Alias for NO_PREMULTIPLIED_ALPHA.
     * @type {number}
     * @default 0
     */
    NPM = 0,
    /**
     * Default option, alias for PREMULTIPLY_ON_UPLOAD.
     * @type {number}
     * @default 1
     */
    UNPACK = 1,
    /**
     * Alias for PREMULTIPLIED_ALPHA.
     * @type {number}
     * @default 2
     */
    PMA = 2,
    /**
     * Source is not premultiplied, leave it like that.
     * Option for compressed and data textures that are created from typed arrays.
     * @type {number}
     * @default 0
     */
    NO_PREMULTIPLIED_ALPHA = 0,
    /**
     * Source is not premultiplied, premultiply on upload.
     * Default option, used for all loaded images.
     * @type {number}
     * @default 1
     */
    PREMULTIPLY_ON_UPLOAD = 1,
    /**
     * Source is already premultiplied. Example: spine atlases with `_pma` suffix.
     * @type {number}
     * @default 2
     */
    PREMULTIPLIED_ALPHA = 2,
}

/**
 * Configure whether filter textures are cleared after binding.
 *
 * Filter textures need not be cleared if the filter does not use pixel blending. {@link PIXI.CLEAR_MODES.BLIT} will detect
 * this and skip clearing as an optimization.
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum CLEAR_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * Alias for BLEND, same as `false` in earlier versions
     * @default 0
     */
    NO = 0,
    /**
     * Alias for CLEAR, same as `true` in earlier versions
     * @default 1
     */
    YES = 1,
    /**
     * Alias for BLIT
     * @default 2
     */
    AUTO = 2,
    /**
     * Do not clear the filter texture. The filter's output will blend on top of the output texture.
     * @default 0
     */
    BLEND = 0,
    /**
     * Always clear the filter texture.
     * @default 1
     */
    CLEAR = 1,
    /**
     * Clear only if {@link PIXI.FilterSystem.forceClear} is set or if the filter uses pixel blending.
     * @default 2
     */
    BLIT = 2,
}

/**
 * The gc modes that are supported by pixi.
 *
 * The {@link PIXI.TextureGCSystem.defaultMode} Garbage Collection mode for PixiJS textures is AUTO
 * If set to GC_MODE, the renderer will occasionally check textures usage. If they are not
 * used for a specified period of time they will be removed from the GPU. They will of course
 * be uploaded again when they are required. This is a silent behind the scenes process that
 * should ensure that the GPU does not  get filled up.
 *
 * Handy for mobile devices!
 * This property only affects WebGL.
 * @enum {number}
 * @static
 * @memberof PIXI
 */
export enum GC_MODES
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * Garbage collection will happen periodically automatically
     * @default 0
     */
    AUTO,
    /**
     * Garbage collection will need to be called manually
     * @default 1
     */
    MANUAL,
}

/**
 * Constants that specify float precision in shaders.
 * @memberof PIXI
 * @static
 * @enum {string}
 */
export enum PRECISION
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * lowp is at least an 9 bit value.
     * For floating point values they can range from: -2 to +2,
     * for integer values they are similar to Uint8Array or Int8Array
     * @default lowp
     */
    LOW = 'lowp',
    /**
     * mediump is at least a 16 bit value.
     * For floating point values they can range from: -2^14 to +2^14,
     * for integer values they are similar to Uint16Array or Int16Array
     * @default mediump
     */
    MEDIUM = 'mediump',
    /**
     * highp is at least a 32 bit value.
     * For floating point values they can range from: -2^62 to +2^62,
     * for integer values they are similar to Uint32Array or Int32Array
     * @default highp
     */
    HIGH = 'highp',
}

/**
 * Constants for mask implementations.
 * We use `type` suffix because it leads to very different behaviours
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum MASK_TYPES
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * Mask is ignored
     * @default 0
     */
    NONE = 0,
    /**
     * Scissor mask, rectangle on screen, cheap
     * @default 1
     */
    SCISSOR = 1,
    /**
     * Stencil mask, 1-bit, medium, works only if renderer supports stencil
     * @default 2
     */
    STENCIL = 2,
    /**
     * Mask that uses SpriteMaskFilter, uses temporary RenderTexture
     * @default 3
     */
    SPRITE = 3,
    /**
     * Color mask (RGBA)
     * @default 4
     */
    COLOR = 4,
}

/**
 * Bitwise OR of masks that indicate the color channels that are rendered to.
 * @static
 * @memberof PIXI
 * @enum {number}
 */
export enum COLOR_MASK_BITS
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * Red channel.
     * @default 0x1
     */
    RED = 0x1,
    /**
     * Green channel
     * @default 0x2
     */
    GREEN = 0x2,
    /**
     * Blue channel.
     * @default 0x4
     */
    BLUE = 0x4,
    /**
     * Alpha channel.
     * @default 0x
     */
    ALPHA = 0x8
}

/**
 * Constants for multi-sampling antialiasing.
 * @see PIXI.Framebuffer#multisample
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum MSAA_QUALITY
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * No multisampling for this renderTexture
     * @default 0
     */
    NONE = 0,
    /**
     * Try 2 samples
     * @default 2
     */
    LOW = 2,
    /**
     * Try 4 samples
     * @default 4
     */
    MEDIUM = 4,
    /**
     * Try 8 samples
     * @default 8
     */
    HIGH = 8
}

/**
 * Constants for various buffer types in Pixi
 * @see PIXI.BUFFER_TYPE
 * @memberof PIXI
 * @static
 * @enum {number}
 */
export enum BUFFER_TYPE
// eslint-disable-next-line @typescript-eslint/indent
{
    /**
     * buffer type for using as an index buffer
     * @default 34963
     */
    ELEMENT_ARRAY_BUFFER = 34963,
    /**
     * buffer type for using attribute data
     * @default 34962
     */
    ARRAY_BUFFER = 34962,
    /**
     * the buffer type is for uniform buffer objects
     * @default 35345
     */
    UNIFORM_BUFFER = 35345,
}
