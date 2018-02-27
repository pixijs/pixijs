import System from '../System';
import GLProgram from './GLProgram';
import { generateUniformsSync,
    defaultValue,
    compileProgram } from './utils';

let UID = 0;

/**
 * Helper class to create a webGL Texture
 *
 * @class
 * @memberof PIXI.systems
 * @extends PIXI.System
 */
export default class ShaderSystem extends System
{
    /**
     * @param {PIXI.Renderer} renderer - A reference to the current renderer
     */
    constructor(renderer)
    {
        super(renderer);

        /**
         * The current WebGL rendering context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = null;

        this.shader = null;
        this.program = null;

        this.id = UID++;
    }

    contextChange(gl)
    {
        this.gl = gl;
    }

    /**
     * Changes the current shader to the one given in parameter
     *
     * @param {PIXI.Shader} shader - the new shader
     * @param {boolean} dontSync - false if the shader should automatically sync its uniforms.
     * @returns {PIXI.glCore.glProgram} the glProgram that belongs to the shader.
     */
    bind(shader, dontSync)
    {
        shader.uniforms.globals = this.renderer.globalUniforms;

        const program = shader.program;
        const glProgram = program.glPrograms[this.renderer.CONTEXT_UID] || this.generateShader(shader);

        this.shader = shader;

        // TODO - some current pixi plugins bypass this.. so it not safe to use yet..
        if (this.program !== program)
        {
            this.program = program;
            this.gl.useProgram(glProgram.program);
        }

        if (!dontSync)
        {
            this.syncUniformGroup(shader.uniformGroup);
        }

        return glProgram;
    }

    /**
     * Uploads the uniforms values to the currently bound shader.
     *
     * @param {object} uniforms - the uniforms valiues that be applied to the current shader
     */
    setUniforms(uniforms)
    {
        const shader = this.shader.program;
        const glProgram = shader.glPrograms[this.renderer.CONTEXT_UID];

        shader.syncUniforms(glProgram.uniformData, uniforms, this.renderer);
    }

    syncUniformGroup(group)
    {
        const glProgram = this.getglProgram();

        if (!group.static || group.dirtyId !== glProgram.uniformGroups[group.id])
        {
            glProgram.uniformGroups[group.id] = group.dirtyId;
            const syncFunc = group.syncUniforms[this.shader.program.id] || this.createSyncGroups(group);

            syncFunc(glProgram.uniformData, group.uniforms, this.renderer);
        }
    }

    createSyncGroups(group)
    {
        group.syncUniforms[this.shader.program.id] = generateUniformsSync(group, this.shader.program.uniformData);

        return group.syncUniforms[this.shader.program.id];
    }

    /**
     * Returns the underlying GLShade rof the currently bound shader.
     * This can be handy for when you to have a little more control over the setting of your uniforms.
     *
     * @return {PIXI.glCore.Shader} the glProgram for the currently bound Shader for this context
     */
    getglProgram()
    {
        if (this.shader)
        {
            return this.shader.program.glPrograms[this.renderer.CONTEXT_UID];
        }

        return null;
    }

    /**
     * Generates a glProgram verion of the Shader provided.
     *
     * @private
     * @param {PIXI.Shader} shader the shader that the glProgram will be based on.
     * @return {PIXI.glCore.glProgram} A shiney new glProgram
     */
    generateShader(shader)
    {
        const gl = this.gl;

        const program = shader.program;

        const attribMap = {};

        for (const i in program.attributeData)
        {
            attribMap[i] = program.attributeData[i].location;
        }

        const shaderProgram = compileProgram(gl, program.vertexSrc, program.fragmentSrc, attribMap);
        const uniformData = {};

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
     * Destroys this System and removes all its textures
     */
    destroy()
    {
        // TODO implement destroy method for ShaderSystem
        this.destroyed = true;
    }
}
