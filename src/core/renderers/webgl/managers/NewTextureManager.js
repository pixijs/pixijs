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

        this.currentLocation = -1;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    contextChange()
    {
        const gl = this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;

        // TODO move this.. to a nice make empty textures class..
        this.emptyTextures = {}

        this.emptyTextures[gl.TEXTURE_2D] = new GLTexture.fromData(this.gl, null, 1, 1);
        this.emptyTextures[gl.TEXTURE_CUBE_MAP] = new GLTexture(this.gl);

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyTextures[gl.TEXTURE_CUBE_MAP].texture);

        for (var i = 0; i < 6; i++)
        {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA,  1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        for (var i = 0; i < this.boundTextures.length; i++) {
            this.bind(null, i);
        }
    }

    bind(texture, location)
    {

        const gl = this.gl;


        location = location || 0;

        if(this.currentLocation !== location)
        {
            this.currentLocation = location;
            gl.activeTexture(gl.TEXTURE0 + location);
        }

        if(texture)
        {
            texture = texture.baseTexture || texture;

            if(texture.valid)
            {

                const glTexture = texture._glTextures[this.CONTEXT_UID] || this.initTexture(texture);

                gl.bindTexture(texture.target, glTexture.texture);

                if(glTexture.dirtyId !== texture.dirtyId)
                {
                    glTexture.dirtyId = texture.dirtyId;
                    this.updateTexture(texture);
                }

                this.boundTextures[location] = texture;
            }
        }
        else
        {
            gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[gl.TEXTURE_2D].texture);
            this.boundTextures[location] = null;
        }
    }

    unbind(texture)
    {
        const gl = this.gl;

        for (var i = 0; i <  this.boundTextures.length; i++) {

            if(this.boundTextures[i] === texture)
            {
                if(this.currentLocation !== i)
                {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    this.currentLocation = i;
                }

                gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[texture.target].texture);
                this.boundTextures[i] = null;
            }
        }
    }

    initTexture(texture)
    {
        const gl = this.gl;

        var glTexture = new GLTexture(this.gl, -1, -1, texture.format, texture.type);
        glTexture.premultiplyAlpha = texture.premultiplyAlpha;
        // guarentee an update..
        glTexture.dirtyId = -1;

        texture._glTextures[this.CONTEXT_UID] = glTexture;

        return glTexture;
    }

    updateTexture(texture)
    {
        const glTexture = texture._glTextures[this.CONTEXT_UID];
        const gl = this.gl;
        //console.log(gl);

        // TODO there are only 3 textures as far as im aware?
        // Cube / 2D and later 3d. (the latter is WebGL2, we will get to that soon!)
        if(texture.target === gl.TEXTURE_CUBE_MAP)
        {
           // console.log( gl.UNSIGNED_BYTE)
            for (var i = 0; i < texture.sides.length; i++)
            {
                // TODO - we should only upload what changed..
                // but im sure this is not  going to be a problem just yet!
                var texturePart = texture.sides[i];

                if(texturePart.resource)
                {
                    if(texturePart.resource.uploadable)
                    {

                        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + texturePart.side,
                                      0,
                                      texture.format,
                                      texture.format,
                                      texture.type,
                                      texturePart.resource.source);
                    }
                    else
                    {
                        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + texturePart.side,
                                  0,
                                  texture.format,
                                  texture.width,
                                  texture.height,
                                  0,
                                  texture.format,
                                  texture.type,
                                  texturePart.resource.source);
                    }
                }
                else
                {
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + texturePart.side,
                                  0,
                                  texture.format,
                                  texture.width,
                                  texture.height,
                                  0,
                                  texture.format,
                                  texture.type,
                                  null);
                }
            }
        }
        else
        {
            if(texture.resource)
            {
                if(texture.resource.uploadable)
                {
                    glTexture.upload(texture.resource.source);

                }
                else
                {
                    glTexture.uploadData(texture.resource.source, texture.width, texture.height);
                }
            }
            else
            {
                glTexture.uploadData(null, texture.width, texture.height);
            }
        }

        // lets only update what changes..
        this.setStyle(texture);
    }

    setStyle(texture)
    {
        const gl = this.gl;

        gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, texture.wrapMode);
        gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, texture.wrapMode);

        if(texture.mipmap)
        {
            gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
        }
        else
        {
            gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode ? gl.LINEAR : gl.NEAREST);
        }

        gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, texture.scaleMode ? gl.LINEAR : gl.NEAREST);
    }
}