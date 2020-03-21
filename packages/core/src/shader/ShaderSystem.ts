import { System } from '../System';
import { GLProgram } from './GLProgram';
import { generateUniformsSync, unsafeEvalSupported, defaultValue, compileProgram } from './utils';

import type { IGLUniformData } from './GLProgram';
import type { Renderer } from '../Renderer';
import type { IRenderingContext } from '../IRenderingContext';
import type { Shader } from './Shader';
import type { Program } from './Program';
import type { UniformGroup } from './UniformGroup';

let UID = 0;
// defualt sync data so we don't create a new one each time!
const defaultSyncData = { textureCount: 0 };

/**
 * System plugin to the renderer to manage shaders.
 *
 * @class
 * @memberof PIXI.systems
 * @extends PIXI.System
 */
export class ShaderSystem extends System
{
    protected gl: IRenderingContext;
    public shader: Shader;
    public program: Program;
    public id: number;
    public destroyed = false;
    private cache: { [key: string]: Function };
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

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

        this.id = UID++;
    }

    /**
     * Overrideable function by `@pixi/unsafe-eval` to silence
     * throwing an error if platform doesn't support unsafe-evals.
     *
     * @private
     */
    private systemCheck(): void
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

            this.syncUniformGroup(shader.uniformGroup, defaultSyncData);
        }

        return glProgram;
    }

    /**
     * Uploads the uniforms values to the currently bound shader.
     *
     * @param {object} uniforms - the uniforms values that be applied to the current shader
     */
    setUniforms(uniforms: {[x: string]: any}): void
    {
        const shader = this.shader.program;
        const glProgram = shader.glPrograms[this.renderer.CONTEXT_UID];

        shader.syncUniforms(glProgram.uniformData, uniforms, this.renderer);
    }

    /**
     *
     * syncs uniforms on the group
     * @param {*} group the uniform group to sync
     * @param {*} [syncData] this is data that is passed to the sync function and any nested sync functions
     */
    syncUniformGroup(group: UniformGroup, syncData?: any): void
    {
        const glProgram = this.getglProgram();

        if (!group.static || group.dirtyId !== glProgram.uniformGroups[group.id])
        {
            glProgram.uniformGroups[group.id] = group.dirtyId;

            this.syncUniforms(group, glProgram, syncData);
        }
    }

    /**
     * Overrideable by the @pixi/unsafe-eval package to use static
     * syncUnforms instead.
     *
     * @private
     */
    syncUniforms(group: UniformGroup, glProgram: GLProgram, syncData: any): void
    {
        const syncFunc = group.syncUniforms[this.shader.program.id] || this.createSyncGroups(group);

        syncFunc(glProgram.uniformData, group.uniforms, this.renderer, syncData);
    }

    createSyncGroups(group: UniformGroup): Function
    {
        const id = this.getSignature(group, this.shader.program.uniformData);

        if (!this.cache[id])
        {
            this.cache[id] = generateUniformsSync(group, this.shader.program.uniformData);
        }

        group.syncUniforms[this.shader.program.id] = this.cache[id];

        return group.syncUniforms[this.shader.program.id];
    }

    /**
     * Takes a uniform group and data and generates a unique signature for them.
     *
     * @param {PIXI.UniformGroup} group the uniform group to get signature of
     * @param {Object} uniformData uniform information generated by the shader
     * @returns {String} Unique signature of the uniform group
     * @private
     */
    private getSignature(group: UniformGroup, uniformData: {[key: string]: any}): string
    {
        const uniforms = group.uniforms;

        const strings = [];

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
    getglProgram(): GLProgram
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
     * @param {PIXI.Shader} shader the shader that the glProgram will be based on.
     * @return {PIXI.GLProgram} A shiny new glProgram!
     */
    generateShader(shader: Shader): GLProgram
    {
        const gl = this.gl;

        const program = shader.program;

        const attribMap: {[key: string]: number} = {};

        for (const i in program.attributeData)
        {
            attribMap[i] = program.attributeData[i].location;
        }

        const shaderProgram = compileProgram(gl, program.vertexSrc, program.fragmentSrc, attribMap);
        const uniformData: {[key: string]: IGLUniformData} = {};

        for (const i in program.uniformData)
        {
            const data = program.uniformData[i];

            uniformData[i] = {
                location: gl.getUniformLocation(shaderProgram, i),
                value: defaultValue(data.type, data.size),
            };
        }

        const glProgram = new GLProgram(shaderProgram, uniformData);

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
        // TODO implement destroy method for ShaderSystem
        this.destroyed = true;
    }
}
