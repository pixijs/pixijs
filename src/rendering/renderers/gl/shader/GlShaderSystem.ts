import { ExtensionType } from '../../../../extensions/Extensions';
import { generateShaderSyncCode } from './GenerateShaderSyncCode';
import { generateProgram } from './program/generateProgram';

import type { BufferResource } from '../../shared/buffer/BufferResource';
import type { Shader } from '../../shared/shader/Shader';
import type { UniformGroup } from '../../shared/shader/UniformGroup';
import type { GlRenderingContext } from '../context/GlRenderingContext';
import type { WebGLRenderer } from '../WebGLRenderer';
import type { GlProgram } from './GlProgram';
import type { GlProgramData } from './GlProgramData';

export interface ShaderSyncData
{
    textureCount: number;
    blockIndex: number;
}

export type ShaderSyncFunction = (renderer: WebGLRenderer, shader: Shader, syncData: ShaderSyncData) => void;

// default sync data so we don't create a new one each time!
const defaultSyncData: ShaderSyncData = {
    textureCount: 0,
    blockIndex: 0,
};

/**
 * System plugin to the renderer to manage the shaders for WebGL.
 * @memberof rendering
 */
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
    public _gl: WebGL2RenderingContext;
    private _maxBindings: number;
    private _nextIndex = 0;
    private _boundUniformsIdsToIndexHash: Record<number, number> = Object.create(null);
    private _boundIndexToUniformsHash: Record<number, UniformGroup | BufferResource> = Object.create(null);
    private _shaderSyncFunctions: Record<string, ShaderSyncFunction> = Object.create(null);

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    protected contextChange(gl: GlRenderingContext): void
    {
        this._gl = gl;

        this._maxBindings = gl.MAX_UNIFORM_BUFFER_BINDINGS ? gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS) : 0;

        this._programDataHash = Object.create(null);
        this._boundUniformsIdsToIndexHash = Object.create(null);
        this._boundIndexToUniformsHash = Object.create(null);
        /**
         * these need to also be cleared as internally some uniforms are set as an optimisation as the sync
         * function is generated. Specifically the texture ints.
         */
        this._shaderSyncFunctions = Object.create(null);
        this._activeProgram = null;
    }

    /**
     * Changes the current shader to the one given in parameter.
     * @param shader - the new shader
     * @param skipSync - false if the shader should automatically sync its uniforms.
     * @returns the glProgram that belongs to the shader.
     */
    public bind(shader: Shader, skipSync?: boolean): void
    {
        this._setProgram(shader.glProgram);

        if (skipSync) return;

        defaultSyncData.textureCount = 0;
        defaultSyncData.blockIndex = 0;

        let syncFunction = this._shaderSyncFunctions[shader.glProgram._key];

        if (!syncFunction)
        {
            syncFunction = this._shaderSyncFunctions[shader.glProgram._key] = this._generateShaderSync(shader, this);
        }

        syncFunction(this._renderer, shader, defaultSyncData);
    }

    /**
     * Updates the uniform group.
     * @param uniformGroup - the uniform group to update
     */
    public updateUniformGroup(uniformGroup: UniformGroup): void
    {
        this._renderer.uniformGroup.updateUniformGroup(uniformGroup, this._activeProgram, defaultSyncData);
    }

    /**
     * Binds a uniform block to the shader.
     * @param uniformGroup - the uniform group to bind
     * @param name - the name of the uniform block
     * @param index - the index of the uniform block
     */
    public bindUniformBlock(uniformGroup: UniformGroup | BufferResource, name: string, index = 0): void
    {
        const bufferSystem = this._renderer.buffer;
        const programData = this._getProgramData(this._activeProgram);

        const isBufferResource = (uniformGroup as BufferResource)._bufferResource;

        if (isBufferResource)
        {
            this._renderer.ubo.updateUniformGroup(uniformGroup as UniformGroup);
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

    /**
     * Creates a function that can be executed that will sync the shader as efficiently as possible.
     * Overridden by the unsafe eval package if you don't want eval used in your project.
     * @param shader - the shader to generate the sync function for
     * @param shaderSystem - the shader system to use
     * @returns - the generated sync function
     * @ignore
     */
    public _generateShaderSync(shader: Shader, shaderSystem: GlShaderSystem): ShaderSyncFunction
    {
        return generateShaderSyncCode(shader, shaderSystem);
    }
}
