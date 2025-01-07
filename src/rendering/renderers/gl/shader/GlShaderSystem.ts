import { ExtensionType } from '../../../../extensions/Extensions';
import { getMaxTexturesPerBatch } from '../../../batcher/gl/utils/maxRecommendedTextures';
import { generateShaderSyncCode } from './GenerateShaderSyncCode';
import { generateProgram } from './program/generateProgram';

import type { BufferResource } from '../../shared/buffer/BufferResource';
import type { Shader } from '../../shared/shader/Shader';
import type { ShaderSystem } from '../../shared/shader/ShaderSystem';
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
export class GlShaderSystem implements ShaderSystem
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'shader',
    } as const;

    public maxTextures: number;

    /**
     * @internal
     * @private
     */
    public _activeProgram: GlProgram = null;

    private _programDataHash: Record<string, GlProgramData> = Object.create(null);
    private readonly _renderer: WebGLRenderer;
    public _gl: WebGL2RenderingContext;
    private _shaderSyncFunctions: Record<string, ShaderSyncFunction> = Object.create(null);

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
        this._renderer.renderableGC.addManagedHash(this, '_programDataHash');
    }

    protected contextChange(gl: GlRenderingContext): void
    {
        this._gl = gl;

        this._programDataHash = Object.create(null);
        /**
         * these need to also be cleared as internally some uniforms are set as an optimisation as the sync
         * function is generated. Specifically the texture ints.
         */
        this._shaderSyncFunctions = Object.create(null);
        this._activeProgram = null;
        this.maxTextures = getMaxTexturesPerBatch();
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

        // TODO: take into account number of TF buffers. Currently works only with interleaved
        this._renderer.buffer.nextBindBase(!!shader.glProgram.transformFeedbackVaryings);
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

        if (!isBufferResource)
        {
            this._renderer.ubo.updateUniformGroup(uniformGroup as UniformGroup);
        }

        const buffer = uniformGroup.buffer;

        const glBuffer = bufferSystem.updateBuffer(buffer);

        const boundLocation = bufferSystem.freeLocationForBufferBase(glBuffer);

        if (isBufferResource)
        {
            const { offset, size } = (uniformGroup as BufferResource);

            // trivial case of buffer resource, can be cached
            if (offset === 0 && size === buffer.data.byteLength)
            {
                bufferSystem.bindBufferBase(glBuffer, boundLocation);
            }
            else
            {
                bufferSystem.bindBufferRange(glBuffer, boundLocation, offset);
            }
        }
        else if (bufferSystem.getLastBindBaseLocation(glBuffer) !== boundLocation)
        {
            // confirmation that buffer isn't there yet
            bufferSystem.bindBufferBase(glBuffer, boundLocation);
        }

        const uniformBlockIndex = this._activeProgram._uniformBlockData[name].index;

        if (programData.uniformBlockBindings[index] === boundLocation) return;
        programData.uniformBlockBindings[index] = boundLocation;

        this._renderer.gl.uniformBlockBinding(programData.program, uniformBlockIndex, boundLocation);
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

    public resetState(): void
    {
        this._activeProgram = null;
    }
}
