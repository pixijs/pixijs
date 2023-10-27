import { ExtensionType } from '../../../../extensions/Extensions';
import { BufferResource } from '../../shared/buffer/BufferResource';
import { UniformGroup } from '../../shared/shader/UniformGroup';
import { TextureSource } from '../../shared/texture/sources/TextureSource';
import { TextureStyle } from '../../shared/texture/TextureStyle';
import { generateProgram } from './program/generateProgram';

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
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'shader',
    } as const;

    /**
     * @internal
     * @private
     */
    public _activeProgram: GlProgram = null;

    private _programDataHash: Record<string, GlProgramData> = Object.create(null);
    private readonly _renderer: WebGLRenderer;
    private _gl: WebGL2RenderingContext;
    private _maxBindings: number;
    private _nextIndex = 0;
    private _boundUniformsIdsToIndexHash: Record<number, number> = Object.create(null);
    private _boundIndexToUniformsHash: Record<number, UniformGroup | BufferResource> = Object.create(null);

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    protected contextChange(gl: GlRenderingContext): void
    {
        this._gl = gl;

        this._maxBindings = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
    }

    public bind(shader: Shader, skipSync?: boolean): void
    {
        this._setProgram(shader.glProgram);

        if (skipSync) return;

        defaultSyncData.textureCount = 0;
        defaultSyncData.blockIndex = 0;

        const gl = this._gl;

        const programData = this._getProgramData(shader.glProgram);

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
                            shader._uniformBindMap[i as unknown as number][j as unknown as number],
                            defaultSyncData.blockIndex++
                        );
                    }
                    else
                    {
                        this._updateUniformGroup(resource);
                    }
                }
                else if (resource instanceof BufferResource)
                {
                    this.bindUniformBlock(
                        resource,
                        shader._uniformBindMap[i as unknown as number][j as unknown as number],
                        defaultSyncData.blockIndex++
                    );
                }
                else if (resource instanceof TextureSource)
                {
                    // TODO really we should not be binding the sampler here too
                    this._renderer.texture.bind(resource, defaultSyncData.textureCount);

                    const uniformName = shader._uniformBindMap[i as unknown as number][j as unknown as number];

                    const uniformData = programData.uniformData[uniformName];

                    if (uniformData)
                    {
                        if (uniformData.value !== defaultSyncData.textureCount)
                        {
                            gl.uniform1i(uniformData.location, defaultSyncData.textureCount);
                        }

                        defaultSyncData.textureCount++;
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

    private _updateUniformGroup(uniformGroup: UniformGroup): void
    {
        this._renderer.uniformGroup.updateUniformGroup(uniformGroup, this._activeProgram, defaultSyncData);
    }

    public bindUniformBlock(uniformGroup: UniformGroup | BufferResource, name: string, index = 0): void
    {
        const bufferSystem = this._renderer.buffer;
        const programData = this._getProgramData(this._activeProgram);

        const isBufferResource = (uniformGroup as BufferResource)._bufferResource;

        if (isBufferResource)
        {
            this._renderer.uniformBuffer.updateUniformGroup(uniformGroup as UniformGroup);
        }

        bufferSystem.updateBuffer(uniformGroup.buffer);

        let boundIndex = this._boundUniformsIdsToIndexHash[uniformGroup.uid];

        // check if it is already bound..
        if (boundIndex === undefined)
        {
            const nextIndex = this._nextIndex++ % this._maxBindings;

            const currentBoundUniformGroup = this._boundIndexToUniformsHash[nextIndex];

            if (currentBoundUniformGroup)
            {
                this._boundUniformsIdsToIndexHash[currentBoundUniformGroup.uid] = undefined;
            }

            // find a free slot..
            boundIndex = this._boundUniformsIdsToIndexHash[uniformGroup.uid] = nextIndex;
            this._boundIndexToUniformsHash[nextIndex] = uniformGroup;

            if (isBufferResource)
            {
                bufferSystem.bindBufferRange(uniformGroup.buffer, nextIndex, (uniformGroup as BufferResource).offset);
            }
            else
            {
                bufferSystem.bindBufferBase(uniformGroup.buffer, nextIndex);
            }
        }

        const gl = this._gl;

        const uniformBlockIndex = this._activeProgram._uniformBlockData[name].index;

        if (programData.uniformBlockBindings[index] === boundIndex) return;
        programData.uniformBlockBindings[index] = boundIndex;

        gl.uniformBlockBinding(programData.program, uniformBlockIndex, boundIndex);
    }

    private _setProgram(program: GlProgram)
    {
        if (this._activeProgram === program) return;

        this._activeProgram = program;

        const programData = this._getProgramData(program);

        this._gl.useProgram(programData.program);
    }

    /**
     * @param program - the program to get the data for
     * @internal
     * @private
     */
    public _getProgramData(program: GlProgram): GlProgramData
    {
        return this._programDataHash[program._key] || this._createProgramData(program);
    }

    private _createProgramData(program: GlProgram): GlProgramData
    {
        const key = program._key;

        this._programDataHash[key] = generateProgram(this._gl, program);

        return this._programDataHash[key];
    }

    public destroy(): void
    {
        for (const key of Object.keys(this._programDataHash))
        {
            const programData = this._programDataHash[key];

            programData.destroy();
            this._programDataHash[key] = null;
        }

        this._programDataHash = null;
        this._boundUniformsIdsToIndexHash = null;
    }
}
