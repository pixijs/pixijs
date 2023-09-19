import type { GlRenderingContext } from '../../context/GlRenderingContext';

/**
 * Returns a lookup table that maps each type-format pair to a compatible internal format.
 * @function mapTypeAndFormatToInternalFormat
 * @private
 * @param {WebGLRenderingContext} gl - The rendering context.
 * @returns Lookup table.
 */
export function mapFormatToGlType(gl: GlRenderingContext): Record<string, number>
{
    return {
        // 8-bit formats
        r8unorm: gl.UNSIGNED_BYTE,
        r8snorm: gl.BYTE,
        r8uint: gl.UNSIGNED_BYTE,
        r8sint: gl.BYTE,

        // 16-bit formats
        r16uint: gl.UNSIGNED_SHORT,
        r16sint: gl.SHORT,
        r16float: gl.HALF_FLOAT,
        rg8unorm: gl.UNSIGNED_BYTE,
        rg8snorm: gl.BYTE,
        rg8uint: gl.UNSIGNED_BYTE,
        rg8sint: gl.BYTE,

        // 32-bit formats
        r32uint: gl.UNSIGNED_INT,
        r32sint: gl.INT,
        r32float: gl.FLOAT,
        rg16uint: gl.UNSIGNED_SHORT,
        rg16sint: gl.SHORT,
        rg16float: gl.HALF_FLOAT,
        rgba8unorm: gl.UNSIGNED_BYTE,
        'rgba8unorm-srgb': gl.UNSIGNED_BYTE,

        // Packed 32-bit formats
        rgba8snorm: gl.BYTE,
        rgba8uint: gl.UNSIGNED_BYTE,
        rgba8sint: gl.BYTE,
        bgra8unorm: gl.UNSIGNED_BYTE,
        'bgra8unorm-srgb': gl.UNSIGNED_BYTE,
        rgb9e5ufloat: gl.UNSIGNED_INT_5_9_9_9_REV,
        rgb10a2unorm: gl.UNSIGNED_INT_2_10_10_10_REV,
        rg11b10ufloat: gl.UNSIGNED_INT_10F_11F_11F_REV,

        // 64-bit formats
        rg32uint: gl.UNSIGNED_INT,
        rg32sint: gl.INT,
        rg32float: gl.FLOAT,
        rgba16uint: gl.UNSIGNED_SHORT,
        rgba16sint: gl.SHORT,
        rgba16float: gl.HALF_FLOAT,

        // 128-bit formats
        rgba32uint: gl.UNSIGNED_INT,
        rgba32sint: gl.INT,
        rgba32float: gl.FLOAT,

        // Depth/stencil formats
        stencil8: gl.UNSIGNED_BYTE,
        depth16unorm: gl.UNSIGNED_SHORT,
        depth24plus: gl.UNSIGNED_INT,
        'depth24plus-stencil8': gl.UNSIGNED_INT_24_8,
        depth32float: gl.FLOAT,
        'depth32float-stencil8': gl.FLOAT_32_UNSIGNED_INT_24_8_REV,

    };
}
