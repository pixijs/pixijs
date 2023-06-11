import { MSAA_QUALITY } from '@pixi/constants';

/**
 * Returns a lookup table that maps each internal format to the list of supported sample counts for this internal format,
 * or null if the context isn't WebGL 2.
 * @memberof PIXI
 * @function detectSupportedSamples
 * @private
 * @param {WebGLRenderingContext} gl - The rendering context.
 * @returns Lookup table.
 */
export function detectSupportedSamples(gl: WebGLRenderingContextBase): Record<number, Array<number>> | null
{
    // WebGL 2 only
    if (!('WebGL2RenderingContext' in globalThis && gl instanceof globalThis.WebGL2RenderingContext))
    {
        return null;
    }

    const supportedSamples = {} as Record<number, Array<number>>;

    // Don't use more than `MAX_SAMPLES`: some devices do not allow to create renderbuffers
    // with more than `MAX_SAMPLES` despite the fact that it is a valid number of samples
    // according to `getInternalformatParameter`.
    const maxSamples = Math.min(gl.getParameter(gl.MAX_SAMPLES) as number, MSAA_QUALITY.HIGH);

    for (const internalFormat of [gl.R8, gl.RG8, gl.RGB8, gl.RGB565,
        gl.RGBA4, gl.RGB5_A1, gl.RGBA8, gl.RGB10_A2, gl.SRGB8_ALPHA8])
    {
        const samples = gl.getInternalformatParameter(gl.RENDERBUFFER, internalFormat, gl.SAMPLES) as number[];

        supportedSamples[internalFormat] = samples.filter((s) => s <= maxSamples && s > 1);
    }

    // Make sure the samples are compatible with valid samples of stencil/depth buffers.
    for (const stencilFormat of [gl.DEPTH_COMPONENT24, gl.DEPTH24_STENCIL8, gl.STENCIL_INDEX8])
    {
        const stencilSamples = gl.getInternalformatParameter(gl.RENDERBUFFER, stencilFormat, gl.SAMPLES) as number[];

        for (const internalFormat in supportedSamples)
        {
            supportedSamples[internalFormat] = supportedSamples[internalFormat].filter(
                (s) => stencilSamples.includes(s));
        }
    }

    return supportedSamples;
}
