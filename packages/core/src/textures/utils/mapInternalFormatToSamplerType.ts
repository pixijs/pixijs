import { SAMPLER_TYPES } from '@pixi/constants';

/**
 * Returns a lookup table that maps each internal format to the compatible sampler type.
 * @memberof PIXI
 * @function mapInternalFormatToSamplerType
 * @private
 * @param {WebGLRenderingContext} gl - The rendering context.
 * @returns Lookup table.
 */
export function mapInternalFormatToSamplerType(gl: WebGLRenderingContextBase):
Record<number, SAMPLER_TYPES>
{
    let table;

    if ('WebGL2RenderingContext' in globalThis && gl instanceof globalThis.WebGL2RenderingContext)
    {
        table = {
            [gl.RGB]: SAMPLER_TYPES.FLOAT,
            [gl.RGBA]: SAMPLER_TYPES.FLOAT,
            [gl.ALPHA]: SAMPLER_TYPES.FLOAT,
            [gl.LUMINANCE]: SAMPLER_TYPES.FLOAT,
            [gl.LUMINANCE_ALPHA]: SAMPLER_TYPES.FLOAT,
            [gl.R8]: SAMPLER_TYPES.FLOAT,
            [gl.R8_SNORM]: SAMPLER_TYPES.FLOAT,
            [gl.RG8]: SAMPLER_TYPES.FLOAT,
            [gl.RG8_SNORM]: SAMPLER_TYPES.FLOAT,
            [gl.RGB8]: SAMPLER_TYPES.FLOAT,
            [gl.RGB8_SNORM]: SAMPLER_TYPES.FLOAT,
            [gl.RGB565]: SAMPLER_TYPES.FLOAT,
            [gl.RGBA4]: SAMPLER_TYPES.FLOAT,
            [gl.RGB5_A1]: SAMPLER_TYPES.FLOAT,
            [gl.RGBA8]: SAMPLER_TYPES.FLOAT,
            [gl.RGBA8_SNORM]: SAMPLER_TYPES.FLOAT,
            [gl.RGB10_A2]: SAMPLER_TYPES.FLOAT,
            [gl.RGB10_A2UI]: SAMPLER_TYPES.FLOAT,
            [gl.SRGB8]: SAMPLER_TYPES.FLOAT,
            [gl.SRGB8_ALPHA8]: SAMPLER_TYPES.FLOAT,
            [gl.R16F]: SAMPLER_TYPES.FLOAT,
            [gl.RG16F]: SAMPLER_TYPES.FLOAT,
            [gl.RGB16F]: SAMPLER_TYPES.FLOAT,
            [gl.RGBA16F]: SAMPLER_TYPES.FLOAT,
            [gl.R32F]: SAMPLER_TYPES.FLOAT,
            [gl.RG32F]: SAMPLER_TYPES.FLOAT,
            [gl.RGB32F]: SAMPLER_TYPES.FLOAT,
            [gl.RGBA32F]: SAMPLER_TYPES.FLOAT,
            [gl.R11F_G11F_B10F]: SAMPLER_TYPES.FLOAT,
            [gl.RGB9_E5]: SAMPLER_TYPES.FLOAT,
            [gl.R8I]: SAMPLER_TYPES.INT,
            [gl.R8UI]: SAMPLER_TYPES.UINT,
            [gl.R16I]: SAMPLER_TYPES.INT,
            [gl.R16UI]: SAMPLER_TYPES.UINT,
            [gl.R32I]: SAMPLER_TYPES.INT,
            [gl.R32UI]: SAMPLER_TYPES.UINT,
            [gl.RG8I]: SAMPLER_TYPES.INT,
            [gl.RG8UI]: SAMPLER_TYPES.UINT,
            [gl.RG16I]: SAMPLER_TYPES.INT,
            [gl.RG16UI]: SAMPLER_TYPES.UINT,
            [gl.RG32I]: SAMPLER_TYPES.INT,
            [gl.RG32UI]: SAMPLER_TYPES.UINT,
            [gl.RGB8I]: SAMPLER_TYPES.INT,
            [gl.RGB8UI]: SAMPLER_TYPES.UINT,
            [gl.RGB16I]: SAMPLER_TYPES.INT,
            [gl.RGB16UI]: SAMPLER_TYPES.UINT,
            [gl.RGB32I]: SAMPLER_TYPES.INT,
            [gl.RGB32UI]: SAMPLER_TYPES.UINT,
            [gl.RGBA8I]: SAMPLER_TYPES.INT,
            [gl.RGBA8UI]: SAMPLER_TYPES.UINT,
            [gl.RGBA16I]: SAMPLER_TYPES.INT,
            [gl.RGBA16UI]: SAMPLER_TYPES.UINT,
            [gl.RGBA32I]: SAMPLER_TYPES.INT,
            [gl.RGBA32UI]: SAMPLER_TYPES.UINT,
            [gl.DEPTH_COMPONENT16]: SAMPLER_TYPES.FLOAT,
            [gl.DEPTH_COMPONENT24]: SAMPLER_TYPES.FLOAT,
            [gl.DEPTH_COMPONENT32F]: SAMPLER_TYPES.FLOAT,
            [gl.DEPTH_STENCIL]: SAMPLER_TYPES.FLOAT,
            [gl.DEPTH24_STENCIL8]: SAMPLER_TYPES.FLOAT,
            [gl.DEPTH32F_STENCIL8]: SAMPLER_TYPES.FLOAT,
        };
    }
    else
    {
        table = {
            [gl.RGB]: SAMPLER_TYPES.FLOAT,
            [gl.RGBA]: SAMPLER_TYPES.FLOAT,
            [gl.ALPHA]: SAMPLER_TYPES.FLOAT,
            [gl.LUMINANCE]: SAMPLER_TYPES.FLOAT,
            [gl.LUMINANCE_ALPHA]: SAMPLER_TYPES.FLOAT,
            [gl.DEPTH_STENCIL]: SAMPLER_TYPES.FLOAT,
        };
    }

    return table;
}
