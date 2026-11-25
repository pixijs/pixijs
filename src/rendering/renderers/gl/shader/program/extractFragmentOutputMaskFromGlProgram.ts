import { stripShaderComments } from '../../../shared/shader/utils/stripShaderComments';

/**
 * Matches a fragment output declaration, with or without a layout location:
 * `layout(location = 1) out highp vec2 velocity;`, `out vec4 finalColor;`, `out vec4 colors[2];`.
 * The trailing `;` keeps function parameters (`out vec4 c)`) from matching.
 */
const OUTPUT_REGEX = new RegExp(
    '(?:layout\\s*\\(\\s*location\\s*=\\s*(\\d+)\\s*\\)\\s*)?' // optional layout(location = n)
    + '\\bout\\s+(?:(?:highp|mediump|lowp)\\s+)?\\w+\\s+\\w+' // out [precision] type name
    + '\\s*(?:\\[\\s*(\\d+)\\s*\\])?\\s*;', // optional [length], then ;
    'g',
);

/**
 * Reads which color locations a GLSL fragment shader writes: bit `n` of the mask is set when it
 * writes location `n`.
 *
 * GLSL ES 1.00 shaders write `gl_FragColor`, which is location 0. In GLSL ES 3.00 a lone output
 * without a `layout` qualifier is location 0 too.
 * @param fragment - the processed fragment source
 * @returns the mask, or `null` if the outputs can't be read
 * @internal
 */
export function extractFragmentOutputMaskFromGlProgram(fragment: string): number | null
{
    // GLSL ES 1.00 writes gl_FragColor (location 0), or gl_FragData[n] through an extension; the
    // second isn't read here, so it counts as unknown
    if (!fragment.includes('#version 300 es')) return fragment.includes('gl_FragData') ? null : 0b1;

    const clean = stripShaderComments(fragment);
    let mask = 0;
    let match;

    while ((match = OUTPUT_REGEX.exec(clean)) !== null)
    {
        const location = match[1] === undefined ? 0 : parseInt(match[1], 10);
        const length = match[2] === undefined ? 1 : parseInt(match[2], 10);

        mask |= ((1 << length) - 1) << location;
    }

    OUTPUT_REGEX.lastIndex = 0;

    if (mask) return mask;

    // no `out` at all is a shader that writes no color (a depth-only pass). An `out` that wasn't read
    // (`out vec4 a, b;`, one built by a macro) is unknown, which writes every attachment
    return (/\bout\b/).test(clean) ? null : 0;
}
