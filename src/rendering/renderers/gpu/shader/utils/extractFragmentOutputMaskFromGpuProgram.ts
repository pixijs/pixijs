import { stripShaderComments } from '../../../shared/shader/utils/stripShaderComments';

import type { ProgramSource } from '../GpuProgram';

const LOCATION_REGEX = /@location\(\s*(\d+)\s*\)/g;

/**
 * ORs together every `@location(n)` in a piece of source: a return type, or the fields of a struct
 * @param declarations - the source to read
 * @returns bit `n` set for each `@location(n)`
 */
function locationMask(declarations: string): number
{
    let mask = 0;
    let match;

    while ((match = LOCATION_REGEX.exec(declarations)) !== null)
    {
        mask |= 1 << parseInt(match[1], 10);
    }

    LOCATION_REGEX.lastIndex = 0;

    return mask;
}

/**
 * Reads which color locations a WGSL fragment entry point writes: bit `n` of the mask is set when
 * it writes `@location(n)`.
 *
 * Handles a single `-> @location(n) T` return and a returned struct. An entry point with no
 * return value, or one that returns only a builtin such as `@builtin(frag_depth)`, writes no color.
 * @param source - the fragment program source
 * @param source.source - the WGSL source
 * @param source.entryPoint - the fragment entry point
 * @returns the mask, or `null` if the outputs can't be read
 * @internal
 */
export function extractFragmentOutputMaskFromGpuProgram({ source, entryPoint }: ProgramSource): number | null
{
    if (!entryPoint) return null;

    const clean = stripShaderComments(source);
    const fnMatch = new RegExp(`fn\\s+${entryPoint}\\s*\\(`).exec(clean);

    if (!fnMatch) return null;

    // walk to the parenthesis that closes the parameter list; parameters carry their own
    // parentheses (`@location(0)`), so count depth rather than searching for the first ')'
    let depth = 1;
    let i = fnMatch.index + fnMatch[0].length;

    while (i < clean.length && depth > 0)
    {
        const char = clean[i++];

        if (char === '(') depth++;
        else if (char === ')') depth--;
    }

    const bodyStart = clean.indexOf('{', i);

    if (bodyStart === -1) return null;

    const signatureTail = clean.substring(i, bodyStart).trim();

    // no `->`: the entry point returns nothing and writes no color
    if (!signatureTail.startsWith('->')) return 0;

    const returnType = signatureTail.substring(2).trim();

    // a builtin return (`@builtin(frag_depth) f32`) writes no color either
    if (returnType.startsWith('@builtin')) return 0;

    // a single `@location(n) T` return carries its own location
    if (returnType.startsWith('@location')) return locationMask(returnType);

    // anything else must be the name of a struct, whose fields carry the locations
    if (!(/^\w+$/).test(returnType)) return null;

    const structBody = new RegExp(`struct\\s+${returnType}\\s*\\{([^}]*)\\}`).exec(clean);

    return structBody ? locationMask(structBody[1]) : null;
}
