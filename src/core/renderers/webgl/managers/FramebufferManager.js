import WebGLManager from './WebGLManager';
import { GLFramebuffer, GLTexture } from 'pixi-gl-core';

/**
 * @class
 * @extends PIXI.WebGLManager
 * @memberof PIXI
 */
export default class FramebufferManager extends WebGLManager
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
     */
    constructor(renderer)
    {
        super(renderer);
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

        this.drawBufferExtension = this.gl.getExtension('WEBGL_draw_buffers');
    }

    bind(framebuffer)
    {
        const gl = this.gl;

        if(framebuffer)
        {
            // TODO cacheing layer!
            const fbo = framebuffer.glFrameBuffers[this.CONTEXT_UID] || this.initFramebuffer(framebuffer);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
            // makesure all textures are unbound..

            // now check for updates...
            if(fbo.dirtyId !== framebuffer.dirtyId)
            {
                fbo.dirtyId = framebuffer.dirtyId;

                this.updateFramebuffer(framebuffer);
            }

             if(framebuffer.colorTextures[0].texturePart)
             {

                this.renderer.texture.unbind(framebuffer.colorTextures[0].texture)
             }
             else
             {

                this.renderer.texture.unbind(framebuffer.colorTextures[0])
             }
        }
        else
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    }

    clear(r, g, b, a)
    {
        var gl = this.gl;

        // TODO clear color can be set only one right?
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    initFramebuffer(framebuffer)
    {
        var fbo = GLFramebuffer.createRGBA(this.gl, framebuffer.width, framebuffer.height);

        framebuffer.glFrameBuffers[this.CONTEXT_UID] = fbo;

        console.log('framebuffer created!', fbo)

        return fbo;
    }

    updateFramebuffer(framebuffer)
    {
        const gl = this.gl;

        const fbo = framebuffer.glFrameBuffers[this.CONTEXT_UID];

        // bind the color texture
        const colorTextures = framebuffer.colorTextures;

        let count = colorTextures.length;

        if(!this.drawBufferExtension)
        {
            count = Math.min(count, 1);
        }

        const activeTextures = [];

        for (var i = 0; i < count; i++)
        {
            let texture = framebuffer.colorTextures[i];

            if(texture.texturePart)
            {
                this.renderer.newTextureManager.bindTexture(texture.texture, 0);

                gl.framebufferTexture2D(gl.FRAMEBUFFER,
                                        gl.COLOR_ATTACHMENT0 + i,
                                        gl.TEXTURE_CUBE_MAP_NEGATIVE_X + texture.side,
                                        texture.texture.glTextures[this.CONTEXT_UID].texture,
                                        0);
            }
            else
            {
                this.renderer.newTextureManager.bindTexture(texture, 0);

                gl.framebufferTexture2D(gl.FRAMEBUFFER,
                                        gl.COLOR_ATTACHMENT0 + i,
                                        gl.TEXTURE_2D,
                                        texture.glTextures[this.CONTEXT_UID].texture,
                                        0);
            }

            activeTextures.push(gl.COLOR_ATTACHMENT0 + i);
        }

        if(this.drawBufferExtension && activeTextures.length > 1)
        {
            this.drawBufferExtension.drawBuffersWEBGL(activeTextures);
        }

        if(framebuffer.stencil || framebuffer.depth)
        {
            fbo.enableStencil();
        }
    }

}