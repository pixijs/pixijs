import type { HighFragment, ShaderSource } from '../HighFragment';
import { compileDefines } from './compileDefines';
import { compileHeader } from './compileHeader';

/**
 * injected to the shader to make it compatible with WebGL 2
 * and allow us to use any special WebGL 2 features
 */
const webGL2Header = {
    vertex: `
        #version 300 es
        #define WEBGL2
        {{EXTENSIONS}}
        {{PRECISION}}
        #define texture2D texture
        #define textureCube texture
        #define varying out
        #define attribute in
    `,

    fragment: `
        #version 300 es
        #define WEBGL2
        {{EXTENSIONS}}
        {{PRECISION}}
        #define varying in
        #define texture2D texture
        #define textureCube texture
        #define gl_FragColor color
        out vec4 color;
    `,
};

/**
 * injected into the shader if WebGL1 is used.
 */
const webGL1Header = {
    vertex: `
        #version 100
        {{EXTENSIONS}}
        {{PRECISION}}
    `,

    fragment: `
        #version 100
        {{EXTENSIONS}}
        {{PRECISION}}
    `,
};

/**
 * A high template consists of vertex and fragment source
 */
export interface HighTemplate
{
    name?: string;
    fragment: string;
    vertex: string;
}

const findHooksRx = /\{\{(.*?)\}\}/g;

/**
 * takes a program string and returns an hash mapping the hooks to empty arrays
 * @param programSrc - the program containing hooks
 */
function compileHooks(programSrc: string): Record<string, string[]>
{
    const parts: Record<string, string[]> = {};

    const partMatches = programSrc
        .match(findHooksRx)
        ?.map((hook) => hook.replace(/[{()}]/g, '')) ?? [];

    partMatches.forEach((hook) =>
    {
        parts[hook] = [];
    });

    return parts;
}

const cacheMap: Record<string, HighTemplate> = {};
let CACHE_UID = 1;

/**
 * takes the HighFragment source parts and adds them to the hook hash
 *
 * @param srcParts - the hash of hook arrays
 * @param parts - the code to inject into the hooks
 * @param name - optional the name of the part to add
 */
function addParts(srcParts: Record<string, string>, parts: Record<string, string[]>, name?: string)
{
    if (srcParts)
    {
        for (const i in srcParts)
        {
            if (i !== 'header')
            {
                const id = i.toUpperCase();

                const part = parts[id];

                if (part)
                {
                    if (name)
                    {
                        part.push(`//----${name}----//`);
                    }
                    part.push(srcParts[i]);
                }
                else
                {
                    console.warn(`${i} placement hook does not exist in shader`);
                }
            }
        }
    }
}

/**
 * takes a shader src and replaces any hooks with the HighFragment code.
 *
 * @param templateSrc - the program src template
 * @param fragmentParts - the fragments to inject
 */
function injectFragments(templateSrc: string, fragmentParts: Record<string, string[]>): string
{
    let out = templateSrc;

    for (const i in fragmentParts)
    {
        const parts = fragmentParts[i];

        const toInject = parts.join('\n');

        if (toInject.length)
        {
            out = out.replace(`{{${i}}}`, `//-----${i} START-----//\n${parts.join('\n')}\n//----${i} FINISH----//`);
        }
        else
        {
            out = out.replace(`{{${i}}}`, '');
        }
    }

    return out;
}

/**
 * This function will take a HighShader template, some High fragments
 * and then merge them in to a shader source.
 *
 * @param isWebGL2 - is this webGL 1 or 2?
 * @param template - the source template that the high fragments will be added to
 * @param fragments - an array of high fragments
 * @param defines - any defines to add to the top of the shader
 */
export function compileHighShader(
    isWebGL2: boolean,
    template: HighTemplate,
    fragments: HighFragment[],
    defines?: string[],
): ShaderSource
{
    // TODO make options object - isWebGL2 should be optional

    const cacheId = fragments.map((highFragment) =>
    {
        if (!highFragment.cache) highFragment.cache = CACHE_UID++;

        return highFragment.cache;
    }).sort((a, b) => a - b).join('-');

    if (cacheMap[cacheId]) return cacheMap[cacheId];

    const defineSrc = defines ? compileDefines(defines) : '';

    const compiledHeader = compileHeader(fragments, isWebGL2);

    const header = isWebGL2 ? webGL2Header : webGL1Header;

    const vertexHeader = header.vertex
        .replace('{{EXTENSIONS}}', compiledHeader.vertex.extensions)
        .replace('{{PRECISION}}', 'precision highp float;');

    const fragmentHeader = header.fragment
        .replace('{{EXTENSIONS}}', compiledHeader.fragment.extensions)
        .replace('{{PRECISION}}', 'precision highp float;');

    const vertexParts = compileHooks(template.vertex);
    const fragmentParts = compileHooks(template.fragment);

    fragments.forEach((highFragment) =>
    {
        addParts(isWebGL2 && highFragment.vertex2
            ? highFragment.vertex2 : highFragment.vertex, vertexParts, highFragment.name,
        );
        addParts(isWebGL2 && highFragment.fragment2
            ? highFragment.fragment2 : highFragment.fragment, fragmentParts, highFragment.name,
        );
    });

    let vertex = injectFragments(template.vertex, vertexParts);
    let fragment = injectFragments(template.fragment, fragmentParts);

    const vertName = `#define SHADER_NAME ${template.name ?? 'high'}-vert`;
    const fragName = `#define SHADER_NAME ${template.name ?? 'high'}-frag`;

    vertex = `${vertexHeader}\n${vertName}\n\n${defineSrc}\n\n${compiledHeader.vertex.variables}\n${vertex}`;
    fragment = `${fragmentHeader}\n${fragName}\n\n${defineSrc}\n\n${compiledHeader.fragment.variables}\n${fragment}`;

    cacheMap[cacheId] = {
        vertex,
        fragment,
    };

    return cacheMap[cacheId];
}

