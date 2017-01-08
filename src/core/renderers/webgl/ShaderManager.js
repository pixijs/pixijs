import { GLShader } from 'pixi-gl-core';
import { PRECISION } from '../../const';

/**
 * Helper class to create a webGL Texture
 *
 * @class
 * @memberof PIXI
 */
export default class ShaderManager
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer)
    {
        /**
         * A reference to the current renderer
         *
         * @member {PIXI.WebGLRenderer}
         */
        this.renderer = renderer;

        /**
         * The current WebGL rendering context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = renderer.gl;

        this.shader = null;
    }

    /**
     * Changes the current shader to the one given in parameter
     *
     * @param {PIXI.Shader} shader - the new shader
     * @param {boolean} dontSync - false if the shader should automatically sync its uniforms.
     */
    bindShader(shader, dontSync)
    {
        const glShader = shader.glShaders[this.renderer.CONTEXT_UID] || this.generateShader(shader);

        // TODO - some current pixi plugins bypass this.. so it not safe to use yet..
        // if (this.shader !== shader)
        {
            this.shader = shader;
            this.renderer._bindGLShader(glShader);
        }

        if (!dontSync)
        {
            this.setUniforms(shader.uniforms);
        }
    }

    /**
     * Uploads the uniforms values to the currently bound shader.
     *
     * @param {object} uniforms - the uniforms valiues that be applied to the current shader
     */
    setUniforms(uniforms)
    {
        const shader = this.shader;
        const glShader = shader.glShaders[this.renderer.CONTEXT_UID];

        shader.syncUniforms(glShader.uniformData, uniforms, this.gl);
    }

    /**
     * Returns the underlying GLShade rof the currently bound shader.
     * This can be handy for when you to have a little more control over the setting of your uniforms.
     *
     * @return {PIXI.glCore.Shader} the glShader for the currently bound Shader for this context
     */
    getGLShader()
    {
        return this.shader.glShaders[this.renderer.CONTEXT_UID];
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
        const attribMap = {};

        for (const i in shader.attributeData)
        {
            attribMap[i] = shader.attributeData[i].location;
        }

        const glShader = new GLShader(this.gl, shader.vertexSrc, shader.fragmentSrc, PRECISION.DEFAULT, attribMap);

        shader.glShaders[this.renderer.CONTEXT_UID] = glShader;

        return glShader;
    }

    /**
     * Destroys this manager and removes all its textures
     */
    destroy()
    {
        // TODO implement destroy method for ShaderManager
        this.destroyed = true;
    }
}
