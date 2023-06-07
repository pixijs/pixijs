import { ExtensionType } from '../../../../extensions/Extensions';
import { BufferResource } from '../../shared/buffer/BufferResource';
import { UniformGroup } from '../../shared/shader/UniformGroup';
import { TextureSource } from '../../shared/texture/sources/TextureSource';
import { TextureStyle } from '../../shared/texture/TextureStyle';
import { generateProgram } from './program/generateProgram';

import type { ExtensionMetadata } from '../../../../extensions/Extensions';
import type { Shader } from '../../shared/shader/Shader';
import type { GlRenderingContext } from '../context/GlRenderingContext';
import type { WebGLRenderer } from '../WebGLRenderer';
import type { GlProgram } from './GlProgram';
import type { GlProgramData } from './GlProgramData';

// default sync data so we don't create a new one each time!
const defaultSyncData = {
    textureCount: 0,
    blockIndex: 0,
};

export class GlShaderSystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererSystem,
        ],
        name: 'shader',
    };

    programDataHash: Record<string, GlProgramData> = {};
    renderer: WebGLRenderer;
    gl: WebGL2RenderingContext;

    activeProgram: GlProgram = null;
    maxBindings: number;
    nextIndex = 0;
    boundUniformsIdsToIndexHash: Record<number, number> = {};
    boundIndexToUniformsHash: Record<number, UniformGroup | BufferResource> = {};

    constructor(renderer: WebGLRenderer)
    {
        this.renderer = renderer;
    }

    contextChange(gl: GlRenderingContext): void
    {
        this.gl = gl;

        this.maxBindings = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
    }

    bind(shader: Shader, skipSync?: boolean): void
    {
        this.setProgram(shader.glProgram);

        if (skipSync) return;

        defaultSyncData.textureCount = 0;
        defaultSyncData.blockIndex = 0;

        const gl = this.gl;

        const programData = this.getProgramData(shader.glProgram);

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
                        this.bindUniformBlock(
                            resource,
                            shader.uniformBindMap[i as any as number][j as any as number],
                            defaultSyncData.blockIndex++
                        );
                    }
                    else
                    {
                        this.updateUniformGroup(resource);
                    }
                }
                else if (resource instanceof BufferResource)
                {
                    this.bindUniformBlock(
                        resource,
                        shader.uniformBindMap[i as any as number][j as any as number],
                        defaultSyncData.blockIndex++
                    );
                }
                else if (resource instanceof TextureSource)
                {
                    // TODO really we should not be binding the sampler here too
                    this.renderer.texture.bind(resource, defaultSyncData.textureCount);

                    const uniformName = shader.uniformBindMap[i as any as number][j as any as number];

                    const uniformData = programData.uniformData[uniformName];

                    if (uniformData)
                    {
                        gl.uniform1i(uniformData.location, defaultSyncData.textureCount++);
                    }
                }
                else if (resource instanceof TextureStyle)
                {
                    // TODO not doing anything here works is assuming that textures are bound with the style they own.
                    // this.renderer.texture.bindSampler(resource, defaultSyncData.textureCount);
                }
            }
        }
    }

    updateUniformGroup(uniformGroup: UniformGroup): void
    {
        this.renderer.uniformGroup.updateUniformGroup(uniformGroup, this.activeProgram, defaultSyncData);
    }

    bindUniformBlock(uniformGroup: UniformGroup | BufferResource, name: string, index = 0): void
    {
        const bufferSystem = this.renderer.buffer;
        const programData = this.getProgramData(this.activeProgram);

        const isBufferResource = (uniformGroup as BufferResource).bufferResource;

        if (isBufferResource)
        {
            this.renderer.uniformBuffer.updateUniformGroup(uniformGroup as UniformGroup);
        }

        bufferSystem.updateBuffer(uniformGroup.buffer);

        let boundIndex = this.boundUniformsIdsToIndexHash[uniformGroup.uid];

        // check if it is already bound..
        if (boundIndex === undefined)
        {
            const nextIndex = this.nextIndex++ % this.maxBindings;

            const currentBoundUniformGroup = this.boundIndexToUniformsHash[nextIndex];

            if (currentBoundUniformGroup)
            {
                this.boundUniformsIdsToIndexHash[currentBoundUniformGroup.uid] = undefined;
            }

            // find a free slot..
            boundIndex = this.boundUniformsIdsToIndexHash[uniformGroup.uid] = nextIndex;
            this.boundIndexToUniformsHash[nextIndex] = uniformGroup;

            if (isBufferResource)
            {
                bufferSystem.bindBufferRange(uniformGroup.buffer, nextIndex, (uniformGroup as BufferResource).offset);
            }
            else
            {
                bufferSystem.bindBufferBase(uniformGroup.buffer, nextIndex);
            }
        }

        const gl = this.gl;

        const uniformBlockIndex = this.activeProgram.uniformBlockData[name].index;

        if (programData.uniformBlockBindings[index] === boundIndex) return;
        programData.uniformBlockBindings[index] = boundIndex;

        gl.uniformBlockBinding(programData.program, uniformBlockIndex, boundIndex);
    }

    setProgram(program: GlProgram)
    {
        if (this.activeProgram === program) return;

        this.activeProgram = program;

        const programData = this.getProgramData(program);

        this.gl.useProgram(programData.program);
    }

    getProgramData(program: GlProgram): GlProgramData
    {
        const key = program.key;

        return this.programDataHash[key] || this.createProgramData(program);
    }

    createProgramData(program: GlProgram): GlProgramData
    {
        const key = program.key;

        this.programDataHash[key] = generateProgram(this.gl, program);

        return this.programDataHash[key];
    }
}
