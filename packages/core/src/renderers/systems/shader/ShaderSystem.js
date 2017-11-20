import WebGLSystem from '../WebGLSystem';
import GLShader from './GLShader';
import { settings } from '@pixi/settings';
import generateUniformsSync from '../../../shader/generateUniformsSync';

let UID = 0;

/**
 * Helper class to create a webGL Texture
 *
 * @class
 * @memberof PIXI
 */
export default class ShaderSystem extends WebGLSystem
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
     * @returns {PIXI.glCore.GLShader} the glShader that belongs to the shader.
     */
    bind(shader, dontSync)
    {
        // maybe a better place for this...
        shader.uniforms.globals = this.renderer.globalUniforms;

        const program = shader.program;
        const glShader = program.glShaders[this.renderer.CONTEXT_UID] || this.generateShader(shader);

        this.shader = shader;

        // TODO - some current pixi plugins bypass this.. so it not safe to use yet..
        if (this.program !== program)
        {
            this.program = program;
            glShader.bind();
        }

        if (!dontSync)
        {
            this.syncUniformGroup(shader.uniformGroup);
        }

        return glShader;
    }

    /**
     * Uploads the uniforms values to the currently bound shader.
     *
     * @param {object} uniforms - the uniforms valiues that be applied to the current shader
     */
    setUniforms(uniforms)
    {
        const shader = this.shader.program;
        const glShader = shader.glShaders[this.renderer.CONTEXT_UID];

        shader.syncUniforms(glShader.uniformData, uniforms, this.renderer);
    }

    syncUniformGroup(group)
    {
        const glShader = this.getGLShader();

        if (!group.static || group.dirtyId !== glShader.uniformGroups[group.id])
        {
            glShader.uniformGroups[group.id] = group.dirtyId;
            const syncFunc = group.syncUniforms[this.shader.program.id] || this.createSyncGroups(group);

            syncFunc(glShader.uniformData, group.uniforms, this.renderer);
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
     * @return {PIXI.glCore.Shader} the glShader for the currently bound Shader for this context
     */
    getGLShader()
    {
        if (this.shader)
        {
            return this.shader.program.glShaders[this.renderer.CONTEXT_UID];
        }

        return null;
    }

    /**
     * Generates a GLShader verion of the Shader provided.
     *
     * @private
     * @param {PIXI.Shader} shader the shader that the glShader will be based on.
     * @return {PIXI.glCore.GLShader} A shiney new GLShader
     */
    generateShader(shader)
    {
        const program = shader.program;
        const attribMap = {};

        // insert the global properties too!

        for (const i in program.attributeData)
        {
            attribMap[i] = program.attributeData[i].location;
        }

        const glShader = new GLShader(this.gl,
            program.vertexSrc,
            program.fragmentSrc,
            settings.PRECISION_FRAGMENT,
            attribMap);

        program.glShaders[this.renderer.CONTEXT_UID] = glShader;

        return glShader;
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
