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

        this.shader = null;
    }

    bindShader(shader, dontSync)
    {
        if(this.shader === shader)return;

        this.shader = shader;

        let glShader = shader.glShaders[this.renderer.CONTEXT_UID] || this.generateShader(shader);

        this.renderer._bindGLShader(glShader);
        if(!dontSync)
        {
            this.syncUniforms(glShader, shader);
        }
    }

    setUniforms(uniforms)
    {
        const shader = this.shader;
        const glShader = shader.glShaders[this.renderer.CONTEXT_UID];


        const uniformData = shader.uniformData;
        const realUniforms = shader.realUniforms;

        // 0 is reserverd for the pixi texture so we start at 1!
        let textureCount = 1;
        let i = 0;

        for (i in uniforms)
        {
            uniformData[i].value = uniforms[i];
        }

        // TODO don't need to use the uniform
        for (let i in uniformData)
        {
            if (uniformData[i].type === 'sampler2D' && uniformData[i].value !== 0)
            {
                if (uniformData[i].value.baseTexture)
                {
                    glShader.uniforms[i] = this.renderer.bindTexture(uniformData[i].value, textureCount, true);
              //      console.log( glShader.uniforms[i])
                }
                else
                {
                    glShader.uniforms[i] = textureCount;
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
                if (uniformData[i].value.a !== undefined)
                {
                    glShader.uniforms[i] = uniformData[i].value.toArray(true);
                }
                else
                {
                    glShader.uniforms[i] = uniformData[i].value;
                }
            }
            else if (uniformData[i].type === 'vec2')
            {
                // check if its a point..
                if (uniformData[i].value.x !== undefined)
                {
                    const val = glShader.uniforms[i] || new Float32Array(2);

                    val[0] = uniformData[i].value.x;
                    val[1] = uniformData[i].value.y;
                    glShader.uniforms[i] = val;
                }
                else
                {
                    glShader.uniforms[i] = uniformData[i].value;
                }
            }
            else if (uniformData[i].type === 'float')
            {
                if (glShader.uniforms.data[i].value !== uniformData[i].value)
                {
                    glShader.uniforms[i] = uniformData[i].value;
                }
            }
            else
            {
                glShader.uniforms[i] = uniformData[i].value;
            }
        }
    }

    generateShader(shader)
    {

        const attribMap = {};
        for (const i in shader.attributeData)
        {
            attribMap[i] = shader.attributeData[i].location;
        }

        const glShader = new GLShader(this.gl, shader.vertexSrc, shader.fragmentSrc, PRECISION.DEFAULT, attribMap);

        //TODO should I add this a s a prototype
        glShader.dirtyFlags = {};
        for (var i in shader.realUniforms) {
            glShader.dirtyFlags[i] = 0;
        };
        console.log(glShader.dirtyFlags)

        shader.glShaders[this.renderer.CONTEXT_UID] = glShader;


        return glShader
    }

    /**
     * Uploads the uniforms of the filter.
     *
     * @param {GLShader} shader - The underlying gl shader.
     * @param {PIXI.Filter} filter - The filter we are synchronizing.
     */
    syncUniforms(glShader, shader)
    {
        const uniformData = shader.uniformData;
        const realUniforms = shader.realUniforms;
        const dirtyFlags = glShader.dirtyFlags;

        // 0 is reserverd for the pixi texture so we start at 1!
        let textureCount = 1;

        // TODO don't need to use the uniform
        for (const i in uniformData)
        {
            if(dirtyFlags[i] === uniformData[i].dirtyId)
            {
                //continue;
            }

            dirtyFlags[i] = uniformData[i].dirtyId;

            if (uniformData[i].type === 'sampler2D' && uniformData[i].value !== 0)
            {
                if (uniformData[i].value.baseTexture)
                {
                    glShader.uniforms[i] = this.renderer.bindTexture(uniformData[i].value, textureCount, true);
              //      console.log( glShader.uniforms[i])
                }
                else
                {
                    glShader.uniforms[i] = textureCount;
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
                if (uniformData[i].value.a !== undefined)
                {
                    glShader.uniforms[i] = uniformData[i].value.toArray(true);
                }
                else
                {
                    glShader.uniforms[i] = uniformData[i].value;
                }
            }
            else if (uniformData[i].type === 'vec2')
            {
                // check if its a point..
                if (uniformData[i].value.x !== undefined)
               	{
                    const val = glShader.uniforms[i] || new Float32Array(2);

                    val[0] = uniformData[i].value.x;
                    val[1] = uniformData[i].value.y;
                    glShader.uniforms[i] = val;
                }
                else
               	{
                    glShader.uniforms[i] = uniformData[i].value;
                }
            }
            else if (uniformData[i].type === 'float')
            {
                if (glShader.uniforms.data[i].value !== uniformData[i].value)
                {
                    glShader.uniforms[i] = uniformData[i].value;
                }
            }
            else
            {
                glShader.uniforms[i] = uniformData[i].value;
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
