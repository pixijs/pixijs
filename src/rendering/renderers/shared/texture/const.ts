import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';

/**
 * Specifies the alpha composition mode for textures.
 *
 * - `no-premultiply-alpha`: Does not premultiply alpha.
 * - `premultiply-alpha-on-upload`: Premultiplies alpha on texture upload.
 * - `premultiplied-alpha`: Assumes the texture is already in premultiplied alpha format.
 * @category rendering
 * @advanced
 */
export type ALPHA_MODES =
    'no-premultiply-alpha' |
    'premultiply-alpha-on-upload' |
    'premultiplied-alpha';

/**
 * The texture formats that are supported by pixi.
 *
 * These formats are used to specify the format of textures in WebGPU and WebGL.
 * They include various uncompressed, compressed, and depth/stencil formats.
 * @category rendering
 * @advanced
 */
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

/**
 * The texture dimensions that are supported by pixi.
 *
 * - `1d` is a one-dimensional texture, which is typically used for linear data.
 * - `2d` is a two-dimensional texture, which is commonly used for images and textures.
 * - `3d` is a three-dimensional texture, which is used for volumetric data or 3D textures.
 * @category rendering
 * @advanced
 */
export type TEXTURE_DIMENSIONS =
    | '1d'
    | '2d'
    | '3d';

/**
 * The wrap modes that are supported by pixi.
 *
 * The wrap mode affects the default wrapping mode of future operations.
 * - `clamp-to-edge` is the default mode, which clamps the texture coordinates to the edge of the texture.
 * - `repeat` allows the texture to repeat in both u and v directions.
 * - `mirror-repeat` allows the texture to repeat in both u and v directions, but mirrors the texture on every other repeat.
 * @category rendering
 * @standard
 */
export type WRAP_MODE =
    | 'clamp-to-edge'
    | 'repeat'
    | 'mirror-repeat';

/** @internal */
export enum DEPRECATED_WRAP_MODES
{
    CLAMP = 'clamp-to-edge',

    REPEAT = 'repeat',

    MIRRORED_REPEAT = 'mirror-repeat',
}

/**
 * The wrap modes that are supported by pixi.
 * @deprecated since 8.0.0
 * @category rendering
 * @see WRAP_MODE
 * @advanced
 */
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
 * The scale mode affects the default scaling mode of future operations.
 * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
 *
 * - `nearest` is a pixelating scaling mode, which does not interpolate pixels.
 * - `linear` is a smooth scaling mode, which interpolates pixels for smoother results.
 * @category rendering
 * @standard
 */
export type SCALE_MODE = | 'nearest' | 'linear';

/** @internal */
export enum DEPRECATED_SCALE_MODES
{
    NEAREST = 'nearest',
    LINEAR = 'linear',
}

/**
 * The scale modes that are supported by pixi.
 * @deprecated since 8.0.0
 * @category rendering
 * @see SCALE_MODE
 * @advanced
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

/**
 * The compare function types used for comparing values in various operations.
 * @category rendering
 * @advanced
 */
export type COMPARE_FUNCTION =
    | 'never'
    | 'less'
    | 'equal'
    | 'less-equal'
    | 'greater'
    | 'not-equal'
    | 'greater-equal'
    | 'always';
