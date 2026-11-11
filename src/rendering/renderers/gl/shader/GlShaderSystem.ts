import { ExtensionType } from '../../../../extensions/Extensions';
import { warn } from '../../../../utils/logging/warn';
import { generateShaderSyncCode } from './GenerateShaderSyncCode';
import { finishProgram, startProgram } from './program/generateProgram';

import type { BufferResource } from '../../shared/buffer/BufferResource';
import type { Shader } from '../../shared/shader/Shader';
import type { UniformGroup } from '../../shared/shader/UniformGroup';
import type { GlRenderingContext } from '../context/GlRenderingContext';
import type { WebGLRenderer } from '../WebGLRenderer';
import type { GlProgram } from './GlProgram';
import type { GlProgramData } from './GlProgramData';
import type { StartedProgram } from './program/generateProgram';

/** @internal */
export interface ShaderSyncData
{
    textureCount: number;
}

/** @internal */
export type ShaderSyncFunction = (renderer: WebGLRenderer, shader: Shader, syncData: ShaderSyncData) => void;

// default sync data so we don't create a new one each time!
const defaultSyncData: ShaderSyncData = {
    textureCount: 0,
};

/**
 * System plugin to the renderer to manage the shaders for WebGL.
 * @category rendering
 * @advanced
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

    /** @internal */
    public _activeProgram: GlProgram = null;

    private _programDataHash: Record<string, GlProgramData> = Object.create(null);
    /** Programs whose compile and link prepare started, by key, until a draw or settle finishes them. */
    private _startedPrograms: Record<string, StartedProgram & { program: GlProgram }> = Object.create(null);
    private _parallelCompile: { COMPLETION_STATUS_KHR: number } | null = null;
    private readonly _renderer: WebGLRenderer;
    /** @internal */
    public _gl: WebGL2RenderingContext;
    private _shaderSyncFunctions: Record<string, ShaderSyncFunction> = Object.create(null);

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    protected contextChange(gl: GlRenderingContext): void
    {
        this._gl = gl;

        this._programDataHash = Object.create(null);
        this._startedPrograms = Object.create(null);
        this._parallelCompile = gl.getExtension('KHR_parallel_shader_compile');
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
     */
    public bindUniformBlock(uniformGroup: UniformGroup | BufferResource, name: string): void
    {
        const bufferSystem = this._renderer.buffer;
        const { binding } = this._activeProgram._uniformBlockData[name];

        const isBufferResource = (uniformGroup as BufferResource)._bufferResource;

        if (!isBufferResource)
        {
            this._renderer.ubo.updateUniformGroup(uniformGroup as UniformGroup);
        }

        const glBuffer = bufferSystem.updateBuffer(uniformGroup.buffer);

        if (!isBufferResource)
        {
            bufferSystem.bindBufferBase(glBuffer, binding);

            return;
        }

        const { offset, size } = uniformGroup as BufferResource;

        if (offset === 0 && (size === undefined || size === glBuffer.byteLength))
        {
            bufferSystem.bindBufferBase(glBuffer, binding);

            return;
        }

        // #if _DEBUG
        const alignment = this._renderer.limits.minUniformBufferOffsetAlignment;

        if (offset % alignment !== 0)
        {
            warn(`[GlShaderSystem] uniform block "${name}" has a BufferResource offset of ${offset}, `
                + `which is not a multiple of renderer.limits.minUniformBufferOffsetAlignment (${alignment}). `
                + 'WebGL will not bind it.');
        }
        // #endif

        bufferSystem.bindBufferRange(glBuffer, binding, offset, size);
    }

    private _setProgram(program: GlProgram)
    {
        if (this._activeProgram === program) return;

        this._activeProgram = program;

        const programData = this._getProgramData(program);

        this._gl.useProgram(programData.program);

        // on a target with several color attachments, enable only those this program writes
        this._renderer.renderTarget.adaptor.setFragmentOutputs(program);
    }

    /**
     * @param program - the program to get the data for
     * @internal
     */
    public _getProgramData(program: GlProgram): GlProgramData
    {
        return this._programDataHash[program._key] || this._createProgramData(program);
    }

    private _createProgramData(program: GlProgram): GlProgramData
    {
        const key = program._key;
        const started = this._startedPrograms[key] ?? startProgram(this._gl, program);

        delete this._startedPrograms[key];
        this._programDataHash[key] = finishProgram(this._gl, program, started);

        return this._programDataHash[key];
    }

    /**
     * Starts compiling and linking programs ahead of their first draw, without asking whether either is done: with
     * `KHR_parallel_shader_compile` the driver does the work off this thread. The first draw with a prepared program
     * finishes it instead of compiling it again; {@link GlShaderSystem#settle} finishes the ones that are done before
     * that draw comes. A program already started or linked is skipped.
     * @param programs - the programs to start
     */
    public prepare(programs: GlProgram[]): void
    {
        for (const program of programs)
        {
            const key = program._key;

            if (this._programDataHash[key] || this._startedPrograms[key]) continue;

            this._startedPrograms[key] = { program, ...startProgram(this._gl, program) };
        }
    }

    /**
     * Finishes prepared programs whose link is complete (their status, attributes, uniforms and blocks), so the first
     * draw with each asks the driver nothing. It reads `COMPLETION_STATUS_KHR` first, which never waits, and skips a
     * program still linking; without the extension it cannot tell, so it finishes them in turn. It finishes at least
     * one ready program per call and stops once `budgetMs` have passed.
     * @param budgetMs - how long one call may spend
     * @returns how many prepared programs are not finished yet
     */
    public settle(budgetMs = 4): number
    {
        const t0 = performance.now();

        for (const key of Object.keys(this._startedPrograms))
        {
            if (performance.now() - t0 >= budgetMs) break;

            const started = this._startedPrograms[key];

            if (this._parallelCompile
                && !this._gl.getProgramParameter(started.webGLProgram, this._parallelCompile.COMPLETION_STATUS_KHR))
            {
                continue;
            }

            delete this._startedPrograms[key];
            this._programDataHash[key] = finishProgram(this._gl, started.program, started);
        }

        return Object.keys(this._startedPrograms).length;
    }

    public destroy(): void
    {
        for (const key of Object.keys(this._programDataHash))
        {
            this._programDataHash[key].destroy();
        }

        this._programDataHash = null;
        this._startedPrograms = null;
        this._shaderSyncFunctions = null;
        this._activeProgram = null;
        (this._renderer as null) = null;
        this._gl = null;
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
