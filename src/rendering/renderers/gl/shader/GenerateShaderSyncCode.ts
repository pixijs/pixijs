import { BufferResource } from '../../shared/buffer/BufferResource';
import { UniformGroup } from '../../shared/shader/UniformGroup';
import { TextureSource } from '../../shared/texture/sources/TextureSource';

import type { Shader } from '../../shared/shader/Shader';
import type { GlShaderSystem, ShaderSyncFunction } from './GlShaderSystem';

/**
 * Generates the a function that will efficiently sync shader resources with the GPU.
 * @param shader - The shader to generate the code for
 * @param shaderSystem - An instance of the shader system
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

    let addedTextreSystem = false;
    let textureCount = 0;

    const programData = shaderSystem._getProgramData(shader.glProgram);

    for (const i in shader.groups)
    {
        const group = shader.groups[i];

        funcFragments.push(`
            resources = g[${i}].resources;
        `);

        for (const j in group.resources)
        {
            const resource = group.resources[j];

            if (resource instanceof UniformGroup)
            {
                if (resource.ubo)
                {
                    const resName = shader._uniformBindMap[i][Number(j)];

                    funcFragments.push(`
                        sS.bindUniformBlock(
                            resources[${j}],
                            '${resName}',
                            ${shader.glProgram._uniformBlockData[resName].index}
                        );
                    `);
                }
                else
                {
                    funcFragments.push(`
                        ugS.updateUniformGroup(resources[${j}], p, sD);
                    `);
                }
            }
            else if (resource instanceof BufferResource)
            {
                const resName = shader._uniformBindMap[i][Number(j)];

                funcFragments.push(`
                    sS.bindUniformBlock(
                        resources[${j}],
                        '${resName}',
                        ${shader.glProgram._uniformBlockData[resName].index}
                    );
                `);
            }
            else if (resource instanceof TextureSource)
            {
                const uniformName = shader._uniformBindMap[i as unknown as number][j as unknown as number];

                const uniformData = programData.uniformData[uniformName];

                if (uniformData)
                {
                    if (!addedTextreSystem)
                    {
                        addedTextreSystem = true;
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
