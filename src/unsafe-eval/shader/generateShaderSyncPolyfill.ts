import { BufferResource } from '../../rendering/renderers/shared/buffer/BufferResource';
import { UniformGroup } from '../../rendering/renderers/shared/shader/UniformGroup';
import { TextureSource } from '../../rendering/renderers/shared/texture/sources/TextureSource';
import { TextureStyle } from '../../rendering/renderers/shared/texture/TextureStyle';
import { TextureView } from '../../rendering/renderers/shared/texture/TextureView';

import type { GlProgramData } from '../../rendering/renderers/gl/shader/GlProgramData';
import type { ShaderSyncData, ShaderSyncFunction } from '../../rendering/renderers/gl/shader/GlShaderSystem';
import type { WebGLRenderer } from '../../rendering/renderers/gl/WebGLRenderer';
import type { BindResource } from '../../rendering/renderers/gpu/shader/BindResource';
import type { Shader } from '../../rendering/renderers/shared/shader/Shader';

/** @internal */
export function generateShaderSyncPolyfill(): ShaderSyncFunction
{
    return syncShader;
}

function syncShader(renderer: WebGLRenderer, shader: Shader, syncData: ShaderSyncData): void
{
    const programData = renderer.shader._getProgramData(shader.glProgram);

    // loop through the groups and sync everything...
    for (const i in shader.groups)
    {
        const bindGroup = shader.groups[i];
        const resources = bindGroup.resources;
        const layout = bindGroup.layout;

        if (layout)
        {
            // a group with a layout names its own binding numbers
            for (const name in layout)
            {
                syncResource(renderer, shader, programData, syncData, resources[layout[name]], name);
            }
        }
        else
        {
            // otherwise the shader's numbering names them. A group the renderer adds outside that
            // numbering (the GL mesh adapter's global and local uniforms) has no names, and its
            // plain uniform groups sync without one
            const bindingNames = shader._uniformBindMap[i];

            for (const j in resources)
            {
                syncResource(renderer, shader, programData, syncData, resources[j], bindingNames?.[j as unknown as number]);
            }
        }
    }
}

function syncResource(
    renderer: WebGLRenderer,
    shader: Shader,
    programData: GlProgramData,
    syncData: ShaderSyncData,
    resource: BindResource,
    name: string
): void
{
    // a layout can name a binding the group has not filled, or that a destroy nulled
    if (!resource) return;

    const shaderSystem = renderer.shader;

    if (resource instanceof UniformGroup && !resource.ubo)
    {
        shaderSystem.updateUniformGroup(resource);
    }
    else if (resource instanceof UniformGroup || resource instanceof BufferResource)
    {
        // a shared group can hold a block this program never declares
        if (shader.glProgram._uniformBlockData[name])
        {
            shaderSystem.bindUniformBlock(resource, name, syncData.blockIndex++);
        }
    }
    else if (resource instanceof TextureSource || resource instanceof TextureView)
    {
        // TODO really we should not be binding the sampler here too
        renderer.texture.bind(resource, syncData.textureCount);

        const uniformData = programData.uniformData[name];

        if (uniformData)
        {
            if (uniformData.value !== syncData.textureCount)
            {
                renderer.gl.uniform1i(uniformData.location, syncData.textureCount);
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
