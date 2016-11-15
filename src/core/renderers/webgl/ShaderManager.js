import { GLShader } from 'pixi-gl-core';
import { WRAP_MODES, SCALE_MODES, PRECISION} from '../../const';
import RenderTarget from './utils/RenderTarget';
import { removeItems } from '../../utils';

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
    }

    bindShader(shader)
    {
        let glShader = shader.glShaders[renderer.CONTEXT_UID] || this.generateShader(shader);

        this.renderer._bindGLShader(glShader);
        this.syncUniforms(glShader, shader);

    }

    generateShader(shader)
    {

        const attribMap = {};
        for (const i in shader.attributeData)
        {
            attribMap[i] = shader.attributeData[i].location;
        }

        console.log(attribMap)
        const glShader = new GLShader(this.gl, shader.vertexSrc, shader.fragmentSrc, PRECISION.DEFAULT, attribMap);
        shader.glShaders[renderer.CONTEXT_UID] = glShader;

        return glShader
    }

    /**
     * Uploads the uniforms of the filter.
     *
     * @param {GLShader} shader - The underlying gl shader.
     * @param {PIXI.Filter} filter - The filter we are synchronizing.
     */
    syncUniforms(shader, filter)
    {
        const uniformData = filter.uniformData;
        const uniforms = filter.uniforms;

        // 0 is reserverd for the pixi texture so we start at 1!
        let textureCount = 1;
        let currentState;

        // TODO Cacheing layer..
        for (const i in uniformData)
        {
            if (uniformData[i].type === 'sampler2D' && uniforms[i] !== 0)
            {
                shader.uniforms[i] = textureCount;

                if (uniforms[i].baseTexture)
                {
                    this.renderer.bindTexture(uniforms[i].baseTexture, textureCount);
                }
                else
                {
                    // TODO
                    // this is helpful as renderTargets can also be set.
                    // Although thinking about it, we could probably
                    // make the filter texture cache return a RenderTexture
                    // rather than a renderTarget
                    const gl = this.renderer.gl;

                    gl.activeTexture(gl.TEXTURE0 + textureCount);
                    uniforms[i].texture.bind();
                }

                textureCount++;
            }
            else if (uniformData[i].type === 'mat3')
            {
                // check if its pixi matrix..
                if (uniforms[i].a !== undefined)
                {
                    shader.uniforms[i] = uniforms[i].toArray(true);
                }
                else
                {
                    shader.uniforms[i] = uniforms[i];
                }
            }
            else if (uniformData[i].type === 'vec2')
            {
                // check if its a point..
                if (uniforms[i].x !== undefined)
               	{
                    const val = shader.uniforms[i] || new Float32Array(2);

                    val[0] = uniforms[i].x;
                    val[1] = uniforms[i].y;
                    shader.uniforms[i] = val;
                }
                else
               	{
                    shader.uniforms[i] = uniforms[i];
                }
            }
            else if (uniformData[i].type === 'float')
            {
                if (shader.uniforms.data[i].value !== uniformData[i])
                {
                    shader.uniforms[i] = uniforms[i];
                }
            }
            else
            {
                shader.uniforms[i] = uniforms[i];
            }
        }
    }


    /**
     * Destroys this manager and removes all its textures
     */
    destroy()
    {

    }
}
