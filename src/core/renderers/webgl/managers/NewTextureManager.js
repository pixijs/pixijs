import WebGLManager from './WebGLManager';
import { GLFramebuffer, GLTexture } from 'pixi-gl-core';

/**
 * @class
 * @extends PIXI.WebGLManager
 * @memberof PIXI
 */
export default class TextureManager extends WebGLManager
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
     */
    constructor(renderer)
    {
        super(renderer);
        this.boundTextures = [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ];

    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    onContextChange()
    {
        this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    }

    bindTexture(texture, location)
    {
        const gl = this.gl;

        location = location || 0;

        gl.activeTexture(gl.TEXTURE0 + location);

        if(texture)
        {
            const glTexture = texture.glTextures[this.CONTEXT_UID] || this.initTexture(texture);

            if(texture.isCube)
            {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, glTexture.texture);
            }
            else
            {
                gl.bindTexture(gl.TEXTURE_2D, glTexture.texture);
            }

            this.boundTextures[location] = texture;
        }
        else
        {
            gl.bindTexture(gl.TEXTURE_2D, null);
            this.boundTextures[location] = null;
        }
    }

    unbindTexture(texture)
    {
        for (var i = 0; i <  this.boundTextures.length; i++) {

            if(this.boundTextures[i] === texture)
            {
                gl.activeTexture(gl.TEXTURE0 + location);
                gl.bindTexture(gl.TEXTURE_2D, null);
                this.boundTextures[i] = null;
            }
        }
    }

    initTexture(texture)
    {
        const gl = this.gl;

        var glTexture = new GLTexture(this.gl);

        if(texture.isCube)
        {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, glTexture.texture);

            glTexture.width = texture.width;
            glTexture.height = texture.height;

            // upload the 6 faces..
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glTexture.format,  glTexture.width, glTexture.height, 0, glTexture.format, glTexture.type, null);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glTexture.format,  glTexture.width, glTexture.height, 0, glTexture.format, glTexture.type, null);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glTexture.format,  glTexture.width, glTexture.height, 0, glTexture.format, glTexture.type, null);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glTexture.format,  glTexture.width, glTexture.height, 0, glTexture.format, glTexture.type, null);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glTexture.format,  glTexture.width, glTexture.height, 0, glTexture.format, glTexture.type, null);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glTexture.format,  glTexture.width, glTexture.height, 0, glTexture.format, glTexture.type, null);

            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glTexture.format, glTexture.format, glTexture.type, window.tex1);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glTexture.format, glTexture.format, glTexture.type, window.tex2);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glTexture.format, glTexture.format, glTexture.type, window.tex3);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glTexture.format, glTexture.format, glTexture.type, window.tex4);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glTexture.format, glTexture.format, glTexture.type, window.tex5);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glTexture.format, glTexture.format, glTexture.type, window.tex6);


            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        else
        {
            glTexture.uploadData(null, texture.width, texture.height);

             // settings..
            glTexture.enableNearestScaling();
            glTexture.enableWrapClamp();
        }



        texture.glTextures[this.CONTEXT_UID] = glTexture;

        return glTexture;
    }
}