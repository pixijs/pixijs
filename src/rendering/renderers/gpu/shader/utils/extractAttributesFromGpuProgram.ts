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

    u32: 'uint32',
    'vec2<u32>': 'uint32x2',
    'vec3<u32>': 'uint32x3',
    'vec4<u32>': 'uint32x4',

    bool: 'uint32',
    'vec2<bool>': 'uint32x2',
    'vec3<bool>': 'uint32x3',
    'vec4<bool>': 'uint32x4',
};

export function extractAttributesFromGpuProgram(
    { source, entryPoint }: ProgramSource
): Record<string, ExtractedAttributeData>
{
    const results: Record<string, ExtractedAttributeData> = {};

    // Step 1: Find the start of the mainVert function using string methods
    const mainVertStart = source.indexOf(`fn ${entryPoint}`);

    if (mainVertStart !== -1)
    {
        // Step 2: Find the index of the next '->' after the start of the mainVert function
        const arrowFunctionStart = source.indexOf('->', mainVertStart);

        if (arrowFunctionStart !== -1)
        {
            const functionArgsSubstring = source.substring(mainVertStart, arrowFunctionStart);

            // Apply the inputs regex directly to the trimmed string
            const inputsRegex = /@location\((\d+)\)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)(?:,|\s|$)/g;
            let match;

            while ((match = inputsRegex.exec(functionArgsSubstring)) !== null)
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
        }
    }

    return results;
}
