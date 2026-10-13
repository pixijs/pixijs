import { BufferResource } from '../../shared/buffer/BufferResource';
import { UniformGroup } from '../../shared/shader/UniformGroup';
import { TextureSource } from '../../shared/texture/sources/TextureSource';
import { TextureView } from '../../shared/texture/TextureView';

import type { Shader } from '../../shared/shader/Shader';
import type { GlShaderSystem, ShaderSyncFunction } from './GlShaderSystem';

// the name at each binding number of a layout; this runs once per program, so nothing caches it
function invert(layout: Record<string, number>): Record<number, string>
{
    const names: Record<number, string> = {};

    for (const name in layout) names[layout[name]] = name;

    return names;
}

/**
 * Generates the a function that will efficiently sync shader resources with the GPU.
 * @param shader - The shader to generate the code for
 * @param shaderSystem - An instance of the shader system
 * @internal
 */
export function generateShaderSyncCode(shader: Shader, shaderSystem: GlShaderSystem): ShaderSyncFunction
{
    const funcFragments: string[] = [];

    /**
     * rS = renderer.shader
     * sS = shaderSystem
     * sD = shaderData
     * g = shader.groups
     * s = shader
     * r = renderer
     * ugS = renderer.uniformGroupSystem
     */
    const headerFragments: string[] = [`
        var g = s.groups;
        var sS = r.shader;
        var p = s.glProgram;
        var ugS = r.uniformGroup;
        var resources;
    `];

    let addedTextureSystem = false;
    let textureCount = 0;

    const programData = shaderSystem._getProgramData(shader.glProgram);

    for (const i in shader.groups)
    {
        const group = shader.groups[i];

        // a group with a layout names its own binding numbers; otherwise the shader's numbering names them
        const bindingNames = group.layout ? invert(group.layout) : shader._uniformBindMap[i];

        funcFragments.push(`
            resources = g[${i}].resources;
        `);

        for (const j in group.resources)
        {
            const resource = group.resources[j];

            if (resource instanceof UniformGroup && !resource.ubo)
            {
                funcFragments.push(`
                    ugS.updateUniformGroup(resources[${j}], p, sD);
                `);
            }
            else if (resource instanceof UniformGroup || resource instanceof BufferResource)
            {
                const resName = bindingNames[Number(j)];
                // a shared group can hold a block this program never declares
                const blockData = shader.glProgram._uniformBlockData[resName];

                if (blockData)
                {
                    funcFragments.push(`
                        sS.bindUniformBlock(
                            resources[${j}],
                            '${resName}',
                            ${blockData.index}
                        );
                    `);
                }
            }
            else if (resource instanceof TextureSource || resource instanceof TextureView)
            {
                const uniformName = bindingNames[Number(j)];

                const uniformData = programData.uniformData[uniformName];

                if (uniformData)
                {
                    if (!addedTextureSystem)
                    {
                        addedTextureSystem = true;
                        headerFragments.push(`
                        var tS = r.texture;
                        `);
                    }

                    shaderSystem._gl.uniform1i(uniformData.location, textureCount);

                    funcFragments.push(`
                        tS.bind(resources[${j}], ${textureCount});
                    `);

                    textureCount++;
                }
            }
        }
    }

    const functionSource = [...headerFragments, ...funcFragments].join('\n');

    // eslint-disable-next-line no-new-func
    return new Function('r', 's', 'sD', functionSource) as ShaderSyncFunction;
}
