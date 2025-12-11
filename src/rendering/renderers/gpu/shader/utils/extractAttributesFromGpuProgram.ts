import { getAttributeInfoFromFormat } from '../../../shared/geometry/utils/getAttributeInfoFromFormat';

import type { ExtractedAttributeData } from '../../../gl/shader/program/extractAttributesFromGlProgram';
import type { VertexFormat } from '../../../shared/geometry/const';
import type { ProgramSource } from '../GpuProgram';

const WGSL_TO_VERTEX_TYPES: Record<string, VertexFormat> = {

    f32:  'float32',
    'vec2<f32>': 'float32x2',
    'vec3<f32>': 'float32x3',
    'vec4<f32>': 'float32x4',
    vec2f: 'float32x2',
    vec3f: 'float32x3',
    vec4f: 'float32x4',

    i32: 'sint32',
    'vec2<i32>': 'sint32x2',
    'vec3<i32>': 'sint32x3',
    'vec4<i32>': 'sint32x4',
    vec2i: 'sint32x2',
    vec3i: 'sint32x3',
    vec4i: 'sint32x4',

    u32: 'uint32',
    'vec2<u32>': 'uint32x2',
    'vec3<u32>': 'uint32x3',
    'vec4<u32>': 'uint32x4',
    vec2u: 'uint32x2',
    vec3u: 'uint32x3',
    vec4u: 'uint32x4',

    bool: 'uint32',
    'vec2<bool>': 'uint32x2',
    'vec3<bool>': 'uint32x3',
    'vec4<bool>': 'uint32x4',
};

/** Regex to match @location decorated fields */
const LOCATION_REGEX = /@location\((\d+)\)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)(?:,|\s|\)|$)/g;

/**
 * Parses @location attributes from a string and populates results.
 * @param str - String to search for @location patterns
 * @param results - Results object to populate
 */
function parseLocations(str: string, results: Record<string, ExtractedAttributeData>): void
{
    let match;

    while ((match = LOCATION_REGEX.exec(str)) !== null)
    {
        const format = WGSL_TO_VERTEX_TYPES[match[3] as VertexFormat] ?? 'float32';

        results[match[2]] = {
            location: parseInt(match[1], 10),
            format,
            stride: getAttributeInfoFromFormat(format).stride,
            offset: 0,
            instance: false,
            start: 0,
        };
    }

    // Reset regex state for reuse
    LOCATION_REGEX.lastIndex = 0;
}

/**
 * Strips comments from WGSL source code.
 * @param source - WGSL source code
 * @returns Source with comments removed
 */
function stripComments(source: string): string
{
    return source
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
}

/**
 * Extracts vertex attributes from a WGSL shader program.
 *
 * Supports two styles:
 * 1. Inline @location decorators in function parameters
 * 2. Struct-based input where @location decorators are in the struct definition
 * @param root0
 * @param root0.source
 * @param root0.entryPoint
 * @internal
 */
export function extractAttributesFromGpuProgram(
    { source, entryPoint }: ProgramSource
): Record<string, ExtractedAttributeData>
{
    const results: Record<string, ExtractedAttributeData> = {};

    // Strip comments to avoid false matches
    const cleanSource = stripComments(source);

    // Step 1: Find the start of the vertex function (include '(' to avoid prefix matches)
    const mainVertStart = cleanSource.indexOf(`fn ${entryPoint}(`);

    if (mainVertStart === -1)
    {
        return results;
    }

    // Step 2: Find the index of the next '->' after the start of the function
    const arrowFunctionStart = cleanSource.indexOf('->', mainVertStart);

    if (arrowFunctionStart === -1)
    {
        return results;
    }

    const functionArgsSubstring = cleanSource.substring(mainVertStart, arrowFunctionStart);

    // Step 3: Try parsing inline @location decorators first
    parseLocations(functionArgsSubstring, results);

    // Step 4: If no inline locations found, check for struct-based input
    if (Object.keys(results).length === 0)
    {
        // Match first parameter type: (input: VertexInput, ...) or (data: MyStruct)
        const structMatch = functionArgsSubstring.match(/\(\s*\w+\s*:\s*(\w+)/);

        if (structMatch)
        {
            const structName = structMatch[1];

            // Find the struct definition in the source
            const structRegex = new RegExp(`struct\\s+${structName}\\s*\\{([^}]+)\\}`, 's');
            const structBody = cleanSource.match(structRegex);

            if (structBody)
            {
                // Parse @location from struct body
                parseLocations(structBody[1], results);
            }
        }
    }

    return results;
}
