import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';

/**
 * Specifies the alpha composition mode for textures.
 *
 * - `no-premultiply-alpha`: Does not premultiply alpha.
 * - `premultiply-alpha-on-upload`: Premultiplies alpha on texture upload.
 * - `premultiplied-alpha`: Assumes the texture is already in premultiplied alpha format.
 * @typedef {'no-premultiply-alpha' | 'premultiply-alpha-on-upload' | 'premultiplied-alpha'} ALPHA_MODES
 */
export type ALPHA_MODES =
    'no-premultiply-alpha' |
    'premultiply-alpha-on-upload' |
    'premultiplied-alpha';

/**
 * Constants for multi-sampling antialiasing.
 * @see Framebuffer#multisample
 * @name MSAA_QUALITY
 * @static
 * @enum {number}
 * @property {number} NONE - No multisampling for this renderTexture
 * @property {number} LOW - Try 2 samples
 * @property {number} MEDIUM - Try 4 samples
 * @property {number} HIGH - Try 8 samples
 */
export enum MSAA_QUALITY
{
    NONE = 0,
    LOW = 2,
    MEDIUM = 4,
    HIGH = 8
}

export type TEXTURE_FORMATS =
    // 8-bit formats
    'r8unorm' |
    'r8snorm' |
    'r8uint' |
    'r8sint' |

    // 16-bit formats
    'r16uint' |
    'r16sint' |
    'r16float' |
    'rg8unorm' |
    'rg8snorm' |
    'rg8uint' |
    'rg8sint' |

    // 32-bit formats
    'r32uint' |
    'r32sint' |
    'r32float' |
    'rg16uint' |
    'rg16sint' |
    'rg16float' |
    'rgba8unorm' |
    'rgba8unorm-srgb' |
    'rgba8snorm' |
    'rgba8uint' |
    'rgba8sint' |
    'bgra8unorm' |
    'bgra8unorm-srgb' |
    // Packed 32-bit formats
    'rgb9e5ufloat' |
    'rgb10a2unorm' |
    'rg11b10ufloat' |

    // 64-bit formats
    'rg32uint' |
    'rg32sint' |
    'rg32float' |
    'rgba16uint' |
    'rgba16sint' |
    'rgba16float' |

    // 128-bit formats
    'rgba32uint' |
    'rgba32sint' |
    'rgba32float' |

    // Depth/stencil formats
    'stencil8' |
    'depth16unorm' |
    'depth24plus' |
    'depth24plus-stencil8' |
    'depth32float' |

    // "depth32float-stencil8" feature
    'depth32float-stencil8' |

    // BC compressed formats usable if "texture-compression-bc" is both
    // supported by the device/user agent and enabled in requestDevice.
    'bc1-rgba-unorm' |
    'bc1-rgba-unorm-srgb' |
    'bc2-rgba-unorm' |
    'bc2-rgba-unorm-srgb' |
    'bc3-rgba-unorm' |
    'bc3-rgba-unorm-srgb' |
    'bc4-r-unorm' |
    'bc4-r-snorm' |
    'bc5-rg-unorm' |
    'bc5-rg-snorm' |
    'bc6h-rgb-ufloat' |
    'bc6h-rgb-float' |
    'bc7-rgba-unorm' |
    'bc7-rgba-unorm-srgb' |

    // ETC2 compressed formats usable if "texture-compression-etc2" is both
    // supported by the device/user agent and enabled in requestDevice.
    'etc2-rgb8unorm' |
    'etc2-rgb8unorm-srgb' |
    'etc2-rgb8a1unorm' |
    'etc2-rgb8a1unorm-srgb' |
    'etc2-rgba8unorm' |
    'etc2-rgba8unorm-srgb' |
    'eac-r11unorm' |
    'eac-r11snorm' |
    'eac-rg11unorm' |
    'eac-rg11snorm' |

    // ASTC compressed formats usable if "texture-compression-astc" is both
    // supported by the device/user agent and enabled in requestDevice.
    'astc-4x4-unorm' |
    'astc-4x4-unorm-srgb' |
    'astc-5x4-unorm' |
    'astc-5x4-unorm-srgb' |
    'astc-5x5-unorm' |
    'astc-5x5-unorm-srgb' |
    'astc-6x5-unorm' |
    'astc-6x5-unorm-srgb' |
    'astc-6x6-unorm' |
    'astc-6x6-unorm-srgb' |
    'astc-8x5-unorm' |
    'astc-8x5-unorm-srgb' |
    'astc-8x6-unorm' |
    'astc-8x6-unorm-srgb' |
    'astc-8x8-unorm' |
    'astc-8x8-unorm-srgb' |
    'astc-10x5-unorm' |
    'astc-10x5-unorm-srgb' |
    'astc-10x6-unorm' |
    'astc-10x6-unorm-srgb' |
    'astc-10x8-unorm' |
    'astc-10x8-unorm-srgb' |
    'astc-10x10-unorm' |
    'astc-10x10-unorm-srgb' |
    'astc-12x10-unorm' |
    'astc-12x10-unorm-srgb' |
    'astc-12x12-unorm' |
    'astc-12x12-unorm-srgb';

export type TEXTURE_VIEW_DIMENSIONS =
    '1d' |
    '2d' |
    '2d-array' |
    'cube' |
    'cube-array' |
    '3d';

export type TEXTURE_DIMENSIONS =
    | '1d'
    | '2d'
    | '3d';

export type WRAP_MODE =
    /**
     * The texture uvs are clamped
     * @default 33071
     */
    | 'clamp-to-edge'
    /**
     * The texture uvs tile and repeat
     * @default 10497
     */
    | 'repeat'
    /**
     * The texture uvs tile and repeat with mirroring
     * @default 33648
     */
    | 'mirror-repeat';

export enum DEPRECATED_WRAP_MODES
{
    CLAMP = 'clamp-to-edge',

    REPEAT = 'repeat',

    MIRRORED_REPEAT = 'mirror-repeat',
}

/** @deprecated since 8.0.0 */
export const WRAP_MODES = new Proxy(DEPRECATED_WRAP_MODES, {
    get(target, prop: keyof typeof DEPRECATED_WRAP_MODES)
    {
        // #if _DEBUG
        deprecation(v8_0_0, `DRAW_MODES.${prop} is deprecated, use '${DEPRECATED_WRAP_MODES[prop]}' instead`);
        // #endif

        return target[prop];
    },
});

/**
 * The scale modes that are supported by pixi.
 *
 * The {@link settings.SCALE_MODE} scale mode affects the default scaling mode of future operations.
 * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
 * @static
 */
export type SCALE_MODE =
    /** Pixelating scaling */
 | 'nearest'
     /** Smooth scaling */
 | 'linear';

export enum DEPRECATED_SCALE_MODES
{
    NEAREST = 'nearest',
    LINEAR = 'linear',
}

/**
 * @deprecated since 8.0.0
 */
export const SCALE_MODES = new Proxy(DEPRECATED_SCALE_MODES, {
    get(target, prop: keyof typeof DEPRECATED_SCALE_MODES)
    {
        // #if _DEBUG
        deprecation(v8_0_0, `DRAW_MODES.${prop} is deprecated, use '${DEPRECATED_SCALE_MODES[prop]}' instead`);
        // #endif

        return target[prop];
    },
});

export type COMPARE_FUNCTION =
    | 'never'
    | 'less'
    | 'equal'
    | 'less-equal'
    | 'greater'
    | 'not-equal'
    | 'greater-equal'
    | 'always';
