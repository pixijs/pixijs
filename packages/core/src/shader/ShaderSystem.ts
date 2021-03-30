import { GLProgram } from './GLProgram';
import { generateUniformsSync, unsafeEvalSupported, defaultValue, logProgramError, compileShader } from './utils';

import type { ISystem } from '../ISystem';
import type { IGLUniformData } from './GLProgram';
import type { Renderer } from '../Renderer';
import type { IRenderingContext } from '../IRenderingContext';
import type { Shader } from './Shader';
import type { Program } from './Program';
import type { UniformGroup } from './UniformGroup';
import type { Dict } from '@pixi/utils';
import type { UniformsSyncCallback } from './utils';
import { generateUniformBufferSync } from './utils/generateUniformBufferSync';

import { getAttributeData } from './utils/getAttributeData';
import { getUniformData } from './utils/getUniformData';

let UID = 0;
// default sync data so we don't create a new one each time!
const defaultSyncData = { textureCount: 0, uboCount: 0 };

/**
 * System plugin to the renderer to manage shaders.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.System
 */
export class ShaderSystem implements ISystem
{
    protected gl: IRenderingContext;
    public shader: Shader;
    public program: Program;
    public id: number;
    public destroyed = false;
    private cache: Dict<UniformsSyncCallback>;
    private _uboCache: Dict<{size: number, syncFunc: UniformsSyncCallback}>;
    private renderer: Renderer;

    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        // Validation check that this environment support `new Function`
        this.systemCheck();

        /**
         * The current WebGL rendering context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = null;

        this.shader = null;
        this.program = null;

        /**
         * Cache to holds the generated functions. Stored against UniformObjects unique signature
         * @type {Object}
         * @private
         */
        this.cache = {};
        this._uboCache = {};

        this.id = UID++;
    }

    /**
     * Overrideable function by `@pixi/unsafe-eval` to silence
     * throwing an error if platform doesn't support unsafe-evals.
     *
     * @private
     */
    systemCheck(): void
    {
        if (!unsafeEvalSupported())
        {
            throw new Error('Current environment does not allow unsafe-eval, '
                + 'please use @pixi/unsafe-eval module to enable support.');
        }
    }

    protected contextChange(gl: IRenderingContext): void
    {
        this.gl = gl;
        this.reset();
    }

    /**
     * Changes the current shader to the one given in parameter
     *
     * @param {PIXI.Shader} shader - the new shader
     * @param {boolean} [dontSync] - false if the shader should automatically sync its uniforms.
     * @returns {PIXI.GLProgram} the glProgram that belongs to the shader.
     */
    bind(shader: Shader, dontSync?: boolean): GLProgram
    {
        shader.uniforms.globals = this.renderer.globalUniforms;

        const program = shader.program;
        const glProgram = program.glPrograms[this.renderer.CONTEXT_UID] || this.generateShader(shader);

        this.shader = shader;

        // TODO - some current Pixi plugins bypass this.. so it not safe to use yet..
        if (this.program !== program)
        {
            this.program = program;
            this.gl.useProgram(glProgram.program);
        }

        if (!dontSync)
        {
            defaultSyncData.textureCount = 0;
            defaultSyncData.uboCount = 0;

            this.syncUniformGroup(shader.uniformGroup, defaultSyncData);
        }

        return glProgram;
    }

    /**
     * Uploads the uniforms values to the currently bound shader.
     *
     * @param {object} uniforms - the uniforms values that be applied to the current shader
     */
    setUniforms(uniforms: Dict<any>): void
    {
        const shader = this.shader.program;
        const glProgram = shader.glPrograms[this.renderer.CONTEXT_UID];

        shader.syncUniforms(glProgram.uniformData, uniforms, this.renderer);
    }

    /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
    /**
     *
     * syncs uniforms on the group
     * @param group - the uniform group to sync
     * @param syncData - this is data that is passed to the sync function and any nested sync functions
     */
    syncUniformGroup(group: UniformGroup, syncData?: any): void
    {
        const glProgram = this.getGlProgram();

        if (!group.static || group.dirtyId !== glProgram.uniformDirtyGroups[group.id])
        {
            glProgram.uniformDirtyGroups[group.id] = group.dirtyId;

            this.syncUniforms(group, glProgram, syncData);
        }
    }

    /**
     * Overrideable by the @pixi/unsafe-eval package to use static
     * syncUniforms instead.
     *
     * @private
     */
    syncUniforms(group: UniformGroup, glProgram: GLProgram, syncData: any): void
    {
        const syncFunc = group.syncUniforms[this.shader.program.id] || this.createSyncGroups(group);

        syncFunc(glProgram.uniformData, group.uniforms, this.renderer, syncData);
    }

    createSyncGroups(group: UniformGroup): UniformsSyncCallback
    {
        const id = this.getSignature(group, this.shader.program.uniformData, 'u');

        if (!this.cache[id])
        {
            this.cache[id] = generateUniformsSync(group, this.shader.program.uniformData);
        }

        group.syncUniforms[this.shader.program.id] = this.cache[id];

        return group.syncUniforms[this.shader.program.id];
    }

    /**
     * Syncs uniform buffers
     *
     * @param group - the uniform buffer group to sync
     * @param name - the name of the uniform buffer
     */
    syncUniformBufferGroup(group: UniformGroup, name?: string)
    {
        const glProgram = this.getGlProgram();

        if (!group.static || group.dirtyId !== 0 || !glProgram.uniformGroups[group.id])
        {
            group.dirtyId = 0;

            const syncFunc = glProgram.uniformGroups[group.id]
                || this.createSyncBufferGroup(group, glProgram, name);

            // TODO wrap update in a cache??
            group.buffer.update();

            syncFunc(glProgram.uniformData,
                group.uniforms,
                this.renderer,
                defaultSyncData,
                group.buffer
            );
        }

        this.renderer.buffer.bindBufferBase(group.buffer, glProgram.uniformBufferBindings[name]);
    }

    /**
     * Will create a function that uploads a uniform buffer using the STD140 standard.
     * The upload function will then be cached for future calls
     * If a group is manually managed, then a simple upload function is generated
     *
     * @param group - the uniform buffer group to sync
     * @param glProgram - the gl program to attach the uniform bindings to
     * @param name - the name of the uniform buffer (must exist on the shader)
     */
    protected createSyncBufferGroup(group: UniformGroup, glProgram: GLProgram, name: string): UniformsSyncCallback
    {
        const { gl } = this.renderer;

        this.renderer.buffer.bind(group.buffer);

        // bind them...
        const uniformBlockIndex = this.gl.getUniformBlockIndex(glProgram.program, name);

        glProgram.uniformBufferBindings[name] = this.shader.uniformBindCount;

        gl.uniformBlockBinding(glProgram.program, uniformBlockIndex, this.shader.uniformBindCount);

        this.shader.uniformBindCount++;

        const id = this.getSignature(group, this.shader.program.uniformData, 'ubo');

        let uboData = this._uboCache[id];

        if (!uboData)
        {
            uboData = this._uboCache[id] = generateUniformBufferSync(group, this.shader.program.uniformData);
        }

        if (group.autoManage)
        {
            const data = new Float32Array(uboData.size / 4);

            group.buffer.update(data);
        }

        glProgram.uniformGroups[group.id] = uboData.syncFunc;

        return glProgram.uniformGroups[group.id];
    }

    /**
     * Takes a uniform group and data and generates a unique signature for them.
     *
     * @param {PIXI.UniformGroup} group - the uniform group to get signature of
     * @param {Object} uniformData - uniform information generated by the shader
     * @returns {String} Unique signature of the uniform group
     * @private
     */
    private getSignature(group: {uniforms: Dict<any>}, uniformData: Dict<any>, preFix: string): string
    {
        const uniforms = group.uniforms;

        const strings = [`${preFix}-`];

        for (const i in uniforms)
        {
            strings.push(i);

            if (uniformData[i])
            {
                strings.push(uniformData[i].type);
            }
        }

        return strings.join('-');
    }

    /**
     * Returns the underlying GLShade rof the currently bound shader.
     * This can be handy for when you to have a little more control over the setting of your uniforms.
     *
     * @return {PIXI.GLProgram} the glProgram for the currently bound Shader for this context
     */
    getGlProgram(): GLProgram
    {
        if (this.shader)
        {
            return this.shader.program.glPrograms[this.renderer.CONTEXT_UID];
        }

        return null;
    }

    /**
     * Generates a glProgram version of the Shader provided.
     *
     * @private
     * @param {PIXI.Shader} shader - the shader that the glProgram will be based on.
     * @return {PIXI.GLProgram} A shiny new glProgram!
     */
    generateShader(shader: Shader): GLProgram
    {
        const gl = this.gl;

        const program = shader.program;

        const glVertShader = compileShader(gl, gl.VERTEX_SHADER, program.vertexSrc);
        const glFragShader = compileShader(gl, gl.FRAGMENT_SHADER, program.fragmentSrc);

        const webGLProgram = gl.createProgram();

        gl.attachShader(webGLProgram, glVertShader);
        gl.attachShader(webGLProgram, glFragShader);

        gl.linkProgram(webGLProgram);

        if (!gl.getProgramParameter(webGLProgram, gl.LINK_STATUS))
        {
            logProgramError(gl, webGLProgram, glVertShader, glFragShader);
        }

        program.attributeData = getAttributeData(webGLProgram, gl);
        program.uniformData = getUniformData(webGLProgram, gl);

        const keys = Object.keys(program.attributeData);

        keys.sort((a, b) => (a > b) ? 1 : -1); // eslint-disable-line no-confusing-arrow

        for (let i = 0; i < keys.length; i++)
        {
            program.attributeData[keys[i]].location = i;

            gl.bindAttribLocation(webGLProgram, i, keys[i]);
        }

        gl.linkProgram(webGLProgram);

        gl.deleteShader(glVertShader);
        gl.deleteShader(glFragShader);

        const uniformData: {[key: string]: IGLUniformData} = {};

        for (const i in program.uniformData)
        {
            const data = program.uniformData[i];

            uniformData[i] = {
                location: gl.getUniformLocation(webGLProgram, i),
                value: defaultValue(data.type, data.size),
            };
        }

        const glProgram = new GLProgram(webGLProgram, uniformData);

        program.glPrograms[this.renderer.CONTEXT_UID] = glProgram;

        return glProgram;
    }

    /**
     * Resets ShaderSystem state, does not affect WebGL state
     */
    reset(): void
    {
        this.program = null;
        this.shader = null;
    }

    /**
     * Destroys this System and removes all its textures
     */
    destroy(): void
    {
        this.renderer = null;
        // TODO implement destroy method for ShaderSystem
        this.destroyed = true;
    }
}
