import { FORMATS, TYPES } from '@pixi/constants';

/**
 * Returns a lookup table that maps each type-format pair to a compatible internal format.
 *
 * @memberof PIXI
 * @function mapTypeAndFormatToInternalFormat
 * @private
 * @param {WebGLRenderingContext} gl - The rendering context.
 * @return {{ [type: number]: { [format: number]: number } }} Lookup table.
 */
export function mapTypeAndFormatToInternalFormat(gl: WebGLRenderingContextBase):
    { [type: number]: { [format: number]: number } }
{
    let table;

    if ('WebGL2RenderingContext' in globalThis && gl instanceof globalThis.WebGL2RenderingContext)
    {
        table = {
            [TYPES.UNSIGNED_BYTE]: {
                [FORMATS.RGBA]: gl.RGBA8,
                [FORMATS.RGB]: gl.RGB8,
                [FORMATS.RG]: gl.RG8,
                [FORMATS.RED]: gl.R8,
                [FORMATS.RGBA_INTEGER]: gl.RGBA8UI,
                [FORMATS.RGB_INTEGER]: gl.RGB8UI,
                [FORMATS.RG_INTEGER]: gl.RG8UI,
                [FORMATS.RED_INTEGER]: gl.R8UI,
                [FORMATS.ALPHA]: gl.ALPHA,
                [FORMATS.LUMINANCE]: gl.LUMINANCE,
                [FORMATS.LUMINANCE_ALPHA]: gl.LUMINANCE_ALPHA,
            },
            [TYPES.BYTE]: {
                [FORMATS.RGBA]: gl.RGBA8_SNORM,
                [FORMATS.RGB]: gl.RGB8_SNORM,
                [FORMATS.RG]: gl.RG8_SNORM,
                [FORMATS.RED]: gl.R8_SNORM,
                [FORMATS.RGBA_INTEGER]: gl.RGBA8I,
                [FORMATS.RGB_INTEGER]: gl.RGB8I,
                [FORMATS.RG_INTEGER]: gl.RG8I,
                [FORMATS.RED_INTEGER]: gl.R8I,
            },
            [TYPES.UNSIGNED_SHORT]: {
                [FORMATS.RGBA_INTEGER]: gl.RGBA16UI,
                [FORMATS.RGB_INTEGER]: gl.RGB16UI,
                [FORMATS.RG_INTEGER]: gl.RG16UI,
                [FORMATS.RED_INTEGER]: gl.R16UI,
                [FORMATS.DEPTH_COMPONENT]: gl.DEPTH_COMPONENT16,
            },
            [TYPES.SHORT]: {
                [FORMATS.RGBA_INTEGER]: gl.RGBA16I,
                [FORMATS.RGB_INTEGER]: gl.RGB16I,
                [FORMATS.RG_INTEGER]: gl.RG16I,
                [FORMATS.RED_INTEGER]: gl.R16I,
            },
            [TYPES.UNSIGNED_INT]: {
                [FORMATS.RGBA_INTEGER]: gl.RGBA32UI,
                [FORMATS.RGB_INTEGER]: gl.RGB32UI,
                [FORMATS.RG_INTEGER]: gl.RG32UI,
                [FORMATS.RED_INTEGER]: gl.R32UI,
                [FORMATS.DEPTH_COMPONENT]: gl.DEPTH_COMPONENT24,
            },
            [TYPES.INT]: {
                [FORMATS.RGBA_INTEGER]: gl.RGBA32I,
                [FORMATS.RGB_INTEGER]: gl.RGB32I,
                [FORMATS.RG_INTEGER]: gl.RG32I,
                [FORMATS.RED_INTEGER]: gl.R32I,
            },
            [TYPES.FLOAT]: {
                [FORMATS.RGBA]: gl.RGBA32F,
                [FORMATS.RGB]: gl.RGB32F,
                [FORMATS.RG]: gl.RG32F,
                [FORMATS.RED]: gl.R32F,
                [FORMATS.DEPTH_COMPONENT]: gl.DEPTH_COMPONENT32F,
            },
            [TYPES.HALF_FLOAT]: {
                [FORMATS.RGBA]: gl.RGBA16F,
                [FORMATS.RGB]: gl.RGB16F,
                [FORMATS.RG]: gl.RG16F,
                [FORMATS.RED]: gl.R16F,
            },
            [TYPES.UNSIGNED_SHORT_5_6_5]: {
                [FORMATS.RGB]: gl.RGB565,
            },
            [TYPES.UNSIGNED_SHORT_4_4_4_4]: {
                [FORMATS.RGBA]: gl.RGBA4,
            },
            [TYPES.UNSIGNED_SHORT_5_5_5_1]: {
                [FORMATS.RGBA]: gl.RGB5_A1,
            },
            [TYPES.UNSIGNED_INT_2_10_10_10_REV]: {
                [FORMATS.RGBA]: gl.RGB10_A2,
                [FORMATS.RGBA_INTEGER]: gl.RGB10_A2UI,
            },
            [TYPES.UNSIGNED_INT_10F_11F_11F_REV]: {
                [FORMATS.RGB]: gl.R11F_G11F_B10F,
            },
            [TYPES.UNSIGNED_INT_5_9_9_9_REV]: {
                [FORMATS.RGB]: gl.RGB9_E5,
            },
            [TYPES.UNSIGNED_INT_24_8]: {
                [FORMATS.DEPTH_STENCIL]: gl.DEPTH24_STENCIL8,
            },
            [TYPES.FLOAT_32_UNSIGNED_INT_24_8_REV]: {
                [FORMATS.DEPTH_STENCIL]: gl.DEPTH32F_STENCIL8,
            },
        };
    }
    else
    {
        table = {
            [TYPES.UNSIGNED_BYTE]: {
                [FORMATS.RGBA]: gl.RGBA,
                [FORMATS.RGB]: gl.RGB,
                [FORMATS.ALPHA]: gl.ALPHA,
                [FORMATS.LUMINANCE]: gl.LUMINANCE,
                [FORMATS.LUMINANCE_ALPHA]: gl.LUMINANCE_ALPHA,
            },
            [TYPES.UNSIGNED_SHORT_5_6_5]: {
                [FORMATS.RGB]: gl.RGB,
            },
            [TYPES.UNSIGNED_SHORT_4_4_4_4]: {
                [FORMATS.RGBA]: gl.RGBA,
            },
            [TYPES.UNSIGNED_SHORT_5_5_5_1]: {
                [FORMATS.RGBA]: gl.RGBA,
            },
        };
    }

    return table;
}
