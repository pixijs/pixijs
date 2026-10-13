import type { GlRenderingContext } from '../../context/GlRenderingContext';

/**
 * Returns a lookup table that maps each type-format pair to a compatible internal format.
 * @function mapTypeAndFormatToInternalFormat
 * @private
 * @param {WebGLRenderingContext} gl - The rendering context.
 * @returns Lookup table.
 */
export function mapFormatToGlFormat(gl: GlRenderingContext): Record<string, number>
{
    return {
        // 8-bit formats
        r8unorm: gl.RED,
        r8snorm: gl.RED,
        r8uint: gl.RED_INTEGER,
        r8sint: gl.RED_INTEGER,

        // 16-bit formats
        r16uint: gl.RED_INTEGER,
        r16sint:    gl.RED_INTEGER,
        r16float: gl.RED,
        rg8unorm:  gl.RG,
        rg8snorm:   gl.RG,
        rg8uint:  gl.RG_INTEGER,
        rg8sint:  gl.RG_INTEGER,

        // 32-bit formats
        r32uint: gl.RED_INTEGER,
        r32sint: gl.RED_INTEGER,
        r32float: gl.RED,
        rg16uint:   gl.RG_INTEGER,
        rg16sint:  gl.RG_INTEGER,
        rg16float:  gl.RG,
        rgba8unorm: gl.RGBA,
        'rgba8unorm-srgb': gl.RGBA,

        // Packed 32-bit formats
        rgba8snorm: gl.RGBA,
        rgba8uint: gl.RGBA_INTEGER,
        rgba8sint: gl.RGBA_INTEGER,
        bgra8unorm: gl.RGBA,
        'bgra8unorm-srgb': gl.RGBA,
        rgb9e5ufloat: gl.RGB,
        rgb10a2unorm: gl.RGBA,
        rg11b10ufloat: gl.RGB,

        // 64-bit formats
        rg32uint: gl.RG_INTEGER,
        rg32sint: gl.RG_INTEGER,
        rg32float:  gl.RG,
        rgba16uint: gl.RGBA_INTEGER,
        rgba16sint: gl.RGBA_INTEGER,
        rgba16float: gl.RGBA,

        // 128-bit formats
        rgba32uint: gl.RGBA_INTEGER,
        rgba32sint: gl.RGBA_INTEGER,
        rgba32float: gl.RGBA,

        // Depth/stencil formats
        stencil8: gl.STENCIL_INDEX8,
        depth16unorm: gl.DEPTH_COMPONENT,
        depth24plus: gl.DEPTH_COMPONENT,
        'depth24plus-stencil8': gl.DEPTH_STENCIL,
        depth32float: gl.DEPTH_COMPONENT,
        'depth32float-stencil8': gl.DEPTH_STENCIL,

    };
}
