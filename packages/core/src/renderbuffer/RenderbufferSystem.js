import { Renderbuffer } from './Renderbuffer';
import { System } from '../System';

/**
 * System plugin to the renderer to manage renderbuffers.
 *
 * @memberof PIXI.systems
 */
export class RenderbufferSystem extends System
{
    constructor(renderer)
    {
        super(renderer);

        /**
         * List of renderbuffers that have allocated RBOs so they can be disposed
         * in the future.
         *
         * @member {Array<PIXI.Renderbuffer>}
         * @private
         */
        this.managedRenderbuffers = [];

        /**
         * Renderbuffer value that tells us we don't know what is bound.
         *
         * @member {PIXI.Renderbuffer}
         */
        this.unknownRenderbuffer = new Renderbuffer(10, 10);
    }

    contextChange(gl)
    {
        this.gl = gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;

        /**
         * Current renderbuffer attached to the WebGL context. If this references
         * `this.unknownRenderbuffer`, then we don't know what is attached.
         *
         * @member {PIXI.Renderbuffer}
         */
        this.current = this.unknownRenderbuffer;
    }

    /**
     * Binds the renderbuffer to the only binding location: `gl.RENDERBUFFER`.
     *
     * @param {PIXI.Renderbuffer} renderbuffer
     */
    bind(renderbuffer)
    {
        const { gl } = this;

        if (renderbuffer)
        {
            const rbo = renderbuffer.glRenderbuffers[this.CONTEXT_UID]
                || this.initRenderbuffer(renderbuffer);

            if (this.current !== renderbuffer)
            {
                this.current = renderbuffer;
                gl.bindRenderbuffer(gl.RENDERBUFFER, rbo.renderbuffer);
            }

            if (rbo.dirtyId !== renderbuffer.dirtyId)
            {
                rbo.dirtyId = renderbuffer.dirtyId;
                this.updateRenderbuffer(renderbuffer);
            }
        }
        else if (this.current)
        {
            this.current = null;
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }
    }

    /**
     * Unbinds the current renderbuffer.
     */
    unbind()
    {
        this.bind(null);
    }

    /**
     * Use this after directly changing the WebGL renderbuffer state.
     */
    clearState()
    {
        this.current = this.unknownRenderbuffer;
    }

    /**
     * Gets the {@code WebGLRenderbuffer} object associated with the given
     * renderbuffer for this renderer.
     *
     * @returns WebGLRenderbuffer
     */
    glRenderbuffer(renderbuffer)
    {
        return (renderbuffer.glRenderbuffers[this.CONTEXT_UID]
            || this.initRenderbuffer(renderbuffer)).renderbuffer;
    }

    /**
     * Initializes an RBO for the given renderbuffer.
     *
     * @returns { PIXI.RBO }
     */
    initRenderbuffer(renderbuffer)
    {
        const rbo = {
            renderbuffer: this.gl.createRenderbuffer(),
            dirtyId: -1,
        };

        renderbuffer.glRenderbuffers[this.CONTEXT_UID] = rbo;

        this.managedRenderbuffers.push(renderbuffer);

        return rbo;
    }

    /**
     * Creates & initializes the renderbuffer's object store for this
     * renderer.
     *
     * @param {PIXI.Renderbuffer} renderbuffer
     */
    updateRenderbuffer(renderbuffer)
    {
        const { gl } = this;

        if (renderbuffer.multisample)
        {
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER,
                renderbuffer.samples,
                renderbuffer.internalFormat,
                renderbuffer.width,
                renderbuffer.height);
        }
        else
        {
            gl.renderbufferStorage(gl.RENDERBUFFER,
                renderbuffer.internalFormat,
                renderbuffer.width,
                renderbuffer.height);
        }
    }

    /**
     * Disposes the allocated resources associated with the given renderbuffer.
     *
     * @param {PIXI.Renderbuffer} renderbuffer
     * @param {boolean}[contextLost=false]
     */
    disposeRenderbuffer(renderbuffer, contextLost = false)
    {
        const rbo = renderbuffer.glRenderbuffers[this.CONTEXT_UID];
        const gl = this.gl;

        if (!rbo)
        {
            return;
        }

        delete renderbuffer.glFramebuffers[this.CONTEXT_UID];

        const index = this.managedRenderbuffers.indexOf(renderbuffer);

        if (index >= 0)
        {
            this.managedRenderbuffers.splice(index, 1);
        }

        renderbuffer.disposeRunner.remove(this);

        if (!contextLost)
        {
            gl.deleteRenderbuffer(rbo.renderbuffer);
        }
    }
}

/**
 * @namespace PIXI
 * @typedef {Object} RBO
 *
 * @property {WebGLRenderbuffer} renderbuffer
 * @property {number} dirtyId
 */
