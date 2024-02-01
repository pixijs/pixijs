import { BufferResource } from '../../rendering/renderers/shared/buffer/BufferResource';
import { UniformGroup } from '../../rendering/renderers/shared/shader/UniformGroup';
import { TextureSource } from '../../rendering/renderers/shared/texture/sources/TextureSource';
import { TextureStyle } from '../../rendering/renderers/shared/texture/TextureStyle';

import type { ShaderSyncData, ShaderSyncFunction } from '../../rendering/renderers/gl/shader/GlShaderSystem';
import type { WebGLRenderer } from '../../rendering/renderers/gl/WebGLRenderer';
import type { Shader } from '../../rendering/renderers/shared/shader/Shader';

export function generateShaderSyncPolyfill(): ShaderSyncFunction
{
    return syncShader;
}

function syncShader(renderer: WebGLRenderer, shader: Shader, syncData: ShaderSyncData): void
{
    const gl = renderer.gl;
    const shaderSystem = renderer.shader;
    const programData = shaderSystem._getProgramData(shader.glProgram);

    // loop through the groups and sync everything...
    for (const i in shader.groups)
    {
        const bindGroup = shader.groups[i];

        for (const j in bindGroup.resources)
        {
            const resource = bindGroup.resources[j];

            if (resource instanceof UniformGroup)
            {
                if (resource.ubo)
                {
                    shaderSystem.bindUniformBlock(
                        resource,
                        shader._uniformBindMap[i as unknown as number][j as unknown as number],
                        syncData.blockIndex++
                    );
                }
                else
                {
                    shaderSystem.updateUniformGroup(resource);
                }
            }
            else if (resource instanceof BufferResource)
            {
                shaderSystem.bindUniformBlock(
                    resource,
                    shader._uniformBindMap[i as unknown as number][j as unknown as number],
                    syncData.blockIndex++
                );
            }
            else if (resource instanceof TextureSource)
            {
                // TODO really we should not be binding the sampler here too
                renderer.texture.bind(resource, syncData.textureCount);

                const uniformName = shader._uniformBindMap[i as unknown as number][j as unknown as number];

                const uniformData = programData.uniformData[uniformName];

                if (uniformData)
                {
                    if (uniformData.value !== syncData.textureCount)
                    {
                        gl.uniform1i(uniformData.location, syncData.textureCount);
                    }

                    syncData.textureCount++;
                }
            }
            else if (resource instanceof TextureStyle)
            {
                // TODO not doing anything here works is assuming that textures are bound with the style they own.
                // this.renderer.texture.bindSampler(resource, syncData.textureCount);
            }
        }
    }
}
