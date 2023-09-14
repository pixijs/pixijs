import { addBits } from './utils/addBits';
import { compileHooks } from './utils/compileHooks';
import { compileInputs } from './utils/compileInputs';
import { compileOutputs } from './utils/compileOutputs';
import { injectBits } from './utils/injectBits';

import type { HighShaderBit, HighShaderSource } from './types';

/** A high template consists of vertex and fragment source */
export interface HighShaderTemplate
{
    name?: string;
    fragment: string;
    vertex: string;
}

export interface CompileHighShaderOptions
{
    template: HighShaderTemplate;
    bits: HighShaderBit[];
}

const cacheMap: {[key: string]: HighShaderSource} = Object.create(null);
const bitCacheMap: Map<HighShaderBit, number> = new Map();

let CACHE_UID = 0;

/**
 * This function will take a HighShader template, some High fragments and then merge them in to a shader source.
 * @param options
 * @param options.template
 * @param options.bits
 */
export function compileHighShader({
    template,
    bits
}: CompileHighShaderOptions): HighShaderSource
{
    const cacheId = bits
        .map((highFragment) =>
        {
            if (!bitCacheMap.has(highFragment))
            {
                bitCacheMap.set(highFragment, CACHE_UID++);
            }

            return bitCacheMap.get(highFragment);
        })
        .sort((a, b) => a - b)
        .join('-') + template.vertex + template.fragment;

    if (cacheMap[cacheId]) return cacheMap[cacheId];

    const vertexFragments = bits.map((shaderBit) => shaderBit.vertex).filter((v) => !!v);
    const fragmentFragments = bits.map((shaderBit) => shaderBit.fragment).filter((v) => !!v);

    // process..
    // WebGPU compile inputs and outputs..
    let compiledVertex = compileInputs(vertexFragments, template.vertex);

    compiledVertex = compileOutputs(vertexFragments, compiledVertex);

    const compiledFragment = compileInputs(fragmentFragments, template.fragment, true);

    const vertexParts = compileHooks(template.vertex);
    const fragmentParts = compileHooks(template.fragment);

    bits.forEach((shaderBit) =>
    {
        addBits(shaderBit.vertex, vertexParts, shaderBit.name);
        addBits(shaderBit.fragment, fragmentParts, shaderBit.name);
    });

    const vertex = injectBits(compiledVertex, vertexParts);
    const fragment = injectBits(compiledFragment, fragmentParts);

    cacheMap[cacheId] = {
        vertex,
        fragment,
    };

    return cacheMap[cacheId];
}
