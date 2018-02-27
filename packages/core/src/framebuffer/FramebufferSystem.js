import System from '../System';
import { Rectangle } from '@pixi/math';

/**
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
export default class FramebufferSystem extends System
{
    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    contextChange()
    {
        this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
        this.current = null;
        this.viewport = new Rectangle();

        this.drawBufferExtension = this.renderer.context.extensions.drawBuffers;
    }

    bind(framebuffer, frame)
    {
        const gl = this.gl;

        this.current = framebuffer;

        if (framebuffer)
        {
            // TODO cacheing layer!

            const fbo = framebuffer.glFrameBuffers[this.CONTEXT_UID] || this.initFramebuffer(framebuffer);

            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
            // makesure all textures are unbound..

            // now check for updates...
            if (fbo.dirtyId !== framebuffer.dirtyId)
            {
                fbo.dirtyId = framebuffer.dirtyId;

                if (fbo.dirtyFormat !== framebuffer.dirtyFormat)
                {
                    fbo.dirtyFormat = framebuffer.dirtyFormat;
                    this.updateFramebuffer(framebuffer);
                }
                else if (fbo.dirtySize !== framebuffer.dirtySize)
                {
                    fbo.dirtySize = framebuffer.dirtySize;
                    this.resizeFramebuffer(framebuffer);
                }
            }

            for (let i = 0; i < framebuffer.colorTextures.length; i++)
            {
                if (framebuffer.colorTextures[i].texturePart)
                {
                    this.renderer.texture.unbind(framebuffer.colorTextures[i].texture);
                }
                else
                {
                    this.renderer.texture.unbind(framebuffer.colorTextures[i]);
                }
            }

            if (framebuffer.depthTexture)
            {
                this.renderer.texture.unbind(framebuffer.depthTexture);
            }

            if (frame)
            {
                this.setViewport(frame.x, frame.y, frame.width, frame.height);
            }
            else
            {
                this.setViewport(0, 0, framebuffer.width, framebuffer.height);
            }
        }
        else
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            if (frame)
            {
                this.setViewport(frame.x, frame.y, frame.width, frame.height);
            }
            else
            {
                this.setViewport(0, 0, this.renderer.width, this.renderer.height);
            }
        }
    }

    setViewport(x, y, width, height)
    {
        const v = this.viewport;

        if (v.width !== width || v.height !== height || v.x !== x || v.y !== y)
        {
            v.x = x;
            v.y = y;
            v.width = width;
            v.height = height;

            this.gl.viewport(x, y, width, height);
        }
    }

    get size()
    {
        if (this.current)
        {
            // TODO store temp
            return { x: 0, y: 0, width: this.current.width, height: this.current.height };
        }

        return { x: 0, y: 0, width: this.renderer.width, height: this.renderer.height };
    }

    clear(r, g, b, a)
    {
        const gl = this.gl;

        // TODO clear color can be set only one right?
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    // private functions...

    initFramebuffer(framebuffer)
    {
        const gl = this.gl;

        // TODO - make this a class?
        const fbo = {
            framebuffer: gl.createFramebuffer(),
            stencil: null,
            dirtyId: 0,
            dirtyFormat: 0,
            dirtySize: 0,
        };

        framebuffer.glFrameBuffers[this.CONTEXT_UID] = fbo;

        return fbo;
    }

    resizeFramebuffer(framebuffer)
    {
        const gl = this.gl;

        if (framebuffer.stencil || framebuffer.depth)
        {
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencil);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
        }
    }

    updateFramebuffer(framebuffer)
    {
        const gl = this.gl;

        const fbo = framebuffer.glFrameBuffers[this.CONTEXT_UID];

        // bind the color texture
        const colorTextures = framebuffer.colorTextures;

        let count = colorTextures.length;

        if (!this.drawBufferExtension)
        {
            count = Math.min(count, 1);
        }

        const activeTextures = [];

        for (let i = 0; i < count; i++)
        {
            const texture = framebuffer.colorTextures[i];

            if (texture.texturePart)
            {
                this.renderer.texture.bind(texture.texture, 0);

                gl.framebufferTexture2D(gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0 + i,
                    gl.TEXTURE_CUBE_MAP_NEGATIVE_X + texture.side,
                    texture.texture._glTextures[this.CONTEXT_UID].texture,
                    0);
            }
            else
            {
                this.renderer.texture.bind(texture, 0);

                gl.framebufferTexture2D(gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0 + i,
                    gl.TEXTURE_2D,
                    texture._glTextures[this.CONTEXT_UID].texture,
                    0);
            }

            activeTextures.push(gl.COLOR_ATTACHMENT0 + i);
        }

        if (this.drawBufferExtension && activeTextures.length > 1)
        {
            this.drawBufferExtension.drawBuffersWEBGL(activeTextures);
        }

        if (framebuffer.depthTexture)
        {
            const depthTextureExt = this.renderer.context.extensions.depthTexture;

            if (depthTextureExt)
            {
                const depthTexture = framebuffer.depthTexture;

                this.renderer.texture.bind(depthTexture, 0);

                gl.framebufferTexture2D(gl.FRAMEBUFFER,
                    gl.DEPTH_ATTACHMENT,
                    gl.TEXTURE_2D,
                    depthTexture._glTextures[this.CONTEXT_UID].texture,
                    0);
            }
        }

        if (framebuffer.stencil || framebuffer.depth)
        {
            fbo.stencil = gl.createRenderbuffer();

            gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);

            // TODO.. this is depth AND stencil?
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, fbo.stencil);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
            // fbo.enableStencil();
        }
    }
}
