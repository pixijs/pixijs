import { System } from '../System';
import { Rectangle } from '@pixi/math';
import { ENV, FBO_TARGETS } from '@pixi/constants';
import { settings } from '../settings';
import { Framebuffer } from './Framebuffer';

/**
 * System plugin to the renderer to manage framebuffers.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
export class FramebufferSystem extends System
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        /**
         * A list of managed framebuffers
         * @member {PIXI.Framebuffer[]}
         * @readonly
         */
        this.managedFramebuffers = [];

        /**
         * Framebuffer value that shows that we don't know what is bound
         * @member {Framebuffer}
         * @readonly
         */
        this.unknownFramebuffer = new Framebuffer(10, 10);
    }

    /**
     * Sets up the renderer context and necessary buffers.
     */
    contextChange()
    {
        const gl = this.gl = this.renderer.gl;

        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
        this.current = this.unknownFramebuffer;
        this.viewport = new Rectangle();
        this.hasMRT = true;
        this.writeDepthTexture = true;

        this.disposeAll(true);

        // webgl2
        if (this.renderer.context.webGLVersion === 1)
        {
            // webgl 1!
            let nativeDrawBuffersExtension = this.renderer.context.extensions.drawBuffers;
            let nativeDepthTextureExtension = this.renderer.context.extensions.depthTexture;

            if (settings.PREFER_ENV === ENV.WEBGL_LEGACY)
            {
                nativeDrawBuffersExtension = null;
                nativeDepthTextureExtension = null;
            }

            if (nativeDrawBuffersExtension)
            {
                gl.drawBuffers = (activeTextures) =>
                    nativeDrawBuffersExtension.drawBuffersWEBGL(activeTextures);
            }
            else
            {
                this.hasMRT = false;
                gl.drawBuffers = () =>
                {
                    // empty
                };
            }

            if (!nativeDepthTextureExtension)
            {
                this.writeDepthTexture = false;
            }
        }
    }

    /**
     * Bind a framebuffer
     *
     * @param {PIXI.Framebuffer} framebuffer
     * @param {PIXI.Rectangle} [frame] frame, default is framebuffer size
     */
    bind(framebuffer, frame)
    {
        const { gl } = this;

        if (framebuffer && framebuffer !== this.unknownFramebuffer)
        {
            // TODO caching layer!

            const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID] || this.initFramebuffer(framebuffer);

            if (this.current !== framebuffer)
            {
                this.current = framebuffer;
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
            }
            // make sure all textures are unbound..

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
            if (this.current)
            {
                this.current = null;
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }

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

    /**
     * Copies the pixels in the source color buffer to the destination
     * color buffer. This creates two temporary framebuffers to complete
     * the operation.
     *
     * Works only WebGL 2.
     *
     * @param {PIXI.ColorBuffer} srcBuffer
     * @param {PIXI.ColorBuffer} dstBuffer
     */
    blitColorBuffer(srcBuffer, dstBuffer)
    {
        const srcFb = Framebuffer.fromColorBuffer(srcBuffer);
        const dstFb = Framebuffer.fromColorBuffer(dstBuffer);

        this.blitFramebuffer(srcFb, dstFb);
    }

    /**
     * Transfers all the pixels in the source framebuffer to the destination
     * framebuffer.
     *
     * Works only on WebGL 2.
     *
     * @param {PIXI.Framebuffer} src
     * @param {PIXI.Framebuffer} dst
     */
    blitFramebuffer(src, dst)
    {
        // TODO: Add caching for these two binding points

        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, this.glFramebuffer(src));

        if (src)
        {
            this.updateFramebuffer(src, this.gl.READ_FRAMEBUFFER);
        }

        this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, this.glFramebuffer(dst));

        if (dst)
        {
            this.updateFramebuffer(dst, this.gl.DRAW_FRAMEBUFFER);
        }

        const srcWidth = src ? src.width : this.renderer.screen.width;
        const srcHeight = src ? src.height : this.renderer.screen.height;
        const dstWidth = dst ? dst.width : this.renderer.screen.width;
        const dstHeight = dst ? dst.height : this.renderer.screen.height;

        this.gl.blitFramebuffer(0, 0, srcWidth, srcHeight,
            0, 0, dstWidth, dstHeight,
            this.gl.COLOR_BUFFER_BIT, this.gl.LINEAR);

        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, null);
        this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null);
    }

    /**
     * Set the WebGLRenderingContext's viewport.
     *
     * @param {Number} x - X position of viewport
     * @param {Number} y - Y position of viewport
     * @param {Number} width - Width of viewport
     * @param {Number} height - Height of viewport
     */
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

    /**
     * Get the size of the current width and height. Returns object with `width` and `height` values.
     *
     * @member {object}
     * @readonly
     */
    get size()
    {
        if (this.current)
        {
            // TODO store temp
            return { x: 0, y: 0, width: this.current.width, height: this.current.height };
        }

        return { x: 0, y: 0, width: this.renderer.width, height: this.renderer.height };
    }

    /**
     * Clear the color of the context
     *
     * @param {Number} r - Red value from 0 to 1
     * @param {Number} g - Green value from 0 to 1
     * @param {Number} b - Blue value from 0 to 1
     * @param {Number} a - Alpha value from 0 to 1
     */
    clear(r, g, b, a)
    {
        const { gl } = this;

        // TODO clear color can be set only one right?
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    /**
     * Gets the `WebGLFramebuffer` object associated with the given framebuffer
     * for this renderer.
     *
     * @param {PIXI.Framebuffer} framebuffer
     * @returns {WebGLFramebuffer}
     */
    glFramebuffer(framebuffer)
    {
        if (!framebuffer)
        {
            return null;
        }

        return (framebuffer.glFramebuffers[this.CONTEXT_UID]
            || this.initFramebuffer(framebuffer)).framebuffer;
    }

    /**
     * Initialize framebuffer
     *
     * @protected
     * @param {PIXI.Framebuffer} framebuffer
     */
    initFramebuffer(framebuffer)
    {
        const { gl } = this;

        const fbo = {
            framebuffer: gl.createFramebuffer(),
            stencil: null,
            dirtyId: 0,
            dirtyFormat: 0,
            dirtySize: 0,
        };

        framebuffer.glFramebuffers[this.CONTEXT_UID] = fbo;

        this.managedFramebuffers.push(framebuffer);
        framebuffer.disposeRunner.add(this);

        return fbo;
    }

    /**
     * Resizes the bound framebuffer
     *
     * @protected
     * @param {PIXI.Framebuffer} framebuffer - framebuffer whose FBO is already bound
     * @param {PIXI.FBO_TARGETS} [target=PIXI.FBO_TARGETS.FRAMEBUFFER] - binding point for `framebuffer`
     */
    resizeFramebuffer(framebuffer, target = FBO_TARGETS.FRAMEBUFFER) // eslint-disable-line no-unused-vars
    {
        const { gl } = this;

        const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];

        if (fbo.stencil)
        {
            gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);

            this.renderer.renderbuffer.clearState();
        }

        const colorTextures = framebuffer.colorTextures;

        for (let i = 0; i < colorTextures.length; i++)
        {
            this.renderer.texture.bind(colorTextures[i], 0);
        }

        if (framebuffer.depthTexture)
        {
            this.renderer.texture.bind(framebuffer.depthTexture, 0);
        }
    }

    /**
     * Updates a bound framebuffer
     *
     * @protected
     * @param {PIXI.Framebuffer} framebuffer - framebuffer whose FBO is already bound
     * @param {number} [target=this.gl.FRAMEBUFFER] - binding point for `framebuffer`
     */
    updateFramebuffer(framebuffer, target = FBO_TARGETS.FRAMEBUFFER)
    {
        const { gl } = this;

        const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];

        // bind the color texture
        const colorTextures = framebuffer.colorTextures;

        let count = colorTextures.length;

        if (!gl.drawBuffers)
        {
            count = Math.min(count, 1);
        }

        const activeTextures = [];

        for (let i = 0; i < count; i++)
        {
            const buffer = framebuffer.colorBuffers[i];

            if (buffer.isRenderbuffer)
            {
                this.renderer.renderbuffer.bind(buffer);

                gl.framebufferRenderbuffer(target,
                    gl.COLOR_ATTACHMENT0 + i,
                    gl.RENDERBUFFER,
                    this.renderer.renderbuffer.glRenderbuffer(buffer)
                );
            }
            else if (buffer.texturePart)
            {
                this.renderer.texture.bind(buffer.texture, 0);

                gl.framebufferTexture2D(target,
                    gl.COLOR_ATTACHMENT0 + i,
                    gl.TEXTURE_CUBE_MAP_NEGATIVE_X + buffer.side,
                    buffer.texture._glTextures[this.CONTEXT_UID].texture,
                    0);
            }
            else
            {
                this.renderer.texture.bind(buffer, 0);

                gl.framebufferTexture2D(target,
                    gl.COLOR_ATTACHMENT0 + i,
                    gl.TEXTURE_2D,
                    buffer._glTextures[this.CONTEXT_UID].texture,
                    0);
            }

            activeTextures.push(gl.COLOR_ATTACHMENT0 + i);
        }

        if (activeTextures.length > 1)
        {
            gl.drawBuffers(activeTextures);
        }

        if (framebuffer.depthTexture)
        {
            const writeDepthTexture = this.writeDepthTexture;

            if (writeDepthTexture)
            {
                const depthTexture = framebuffer.depthTexture;

                this.renderer.texture.bind(depthTexture, 0);

                gl.framebufferTexture2D(target,
                    gl.DEPTH_ATTACHMENT,
                    gl.TEXTURE_2D,
                    depthTexture._glTextures[this.CONTEXT_UID].texture,
                    0);
            }
        }

        if (!fbo.stencil && (framebuffer.stencil || framebuffer.depth))
        {
            fbo.stencil = gl.createRenderbuffer();

            gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);

            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
            // TODO.. this is depth AND stencil?
            if (!framebuffer.depthTexture)
            { // you can't have both, so one should take priority if enabled
                gl.framebufferRenderbuffer(target, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, fbo.stencil);
            }

            this.renderer.renderbuffer.clearState();
        }
    }

    /**
     * Disposes framebuffer
     * @param {PIXI.Framebuffer} framebuffer framebuffer that has to be disposed of
     * @param {boolean} [contextLost=false] If context was lost, we suppress all delete function calls
     */
    disposeFramebuffer(framebuffer, contextLost)
    {
        const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
        const gl = this.gl;

        if (!fbo)
        {
            return;
        }

        delete framebuffer.glFramebuffers[this.CONTEXT_UID];

        const index = this.managedFramebuffers.indexOf(framebuffer);

        if (index >= 0)
        {
            this.managedFramebuffers.splice(index, 1);
        }

        framebuffer.disposeRunner.remove(this);

        if (!contextLost)
        {
            gl.deleteFramebuffer(fbo.framebuffer);
            if (fbo.stencil)
            {
                gl.deleteRenderbuffer(fbo.stencil);
            }
        }
    }

    /**
     * Disposes all framebuffers, but not textures bound to them
     *
     * @param {boolean} [contextLost=false] If context was lost, we suppress all delete function calls
     */
    disposeAll(contextLost)
    {
        const list = this.managedFramebuffers;

        this.managedFramebuffers = [];

        for (let i = 0; i < list.length; i++)
        {
            this.disposeFramebuffer(list[i], contextLost);
        }
    }

    /**
     * Forcing creation of stencil buffer for current framebuffer, if it wasn't done before.
     * Used by MaskSystem, when its time to use stencil mask for Graphics element.
     *
     * Its an alternative for public lazy `framebuffer.enableStencil`, in case we need stencil without rebind.
     *
     * @private
     */
    forceStencil()
    {
        const framebuffer = this.current;

        if (!framebuffer)
        {
            return;
        }

        const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];

        if (!fbo || fbo.stencil)
        {
            return;
        }
        framebuffer.enableStencil();

        const w = framebuffer.width;
        const h = framebuffer.height;
        const gl = this.gl;
        const stencil = gl.createRenderbuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, stencil);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h);
        this.renderer.renderbuffer.clearState();

        fbo.stencil = stencil;
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, stencil);
    }

    /**
     * resets framebuffer stored state, binds screen framebuffer
     *
     * should be called before renderTexture reset()
     */
    reset()
    {
        this.current = this.unknownFramebuffer;
        this.viewport = new Rectangle();
    }
}

/**
 * Used to cache context-specific information about a framebuffer.
 *
 * @namespace PIXI
 * @typedef {Object} FBO
 * @property {WebGLFramebuffer} framebuffer
 * @property {WebGLRenderbuffer?} stencil
 * @property {number} dirtyId
 * @property {number} dirtyFormat
 * @property {number} dirtySize
 */
