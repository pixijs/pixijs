import { FORMATS } from '@pixi/constants';
import { Runner } from '@pixi/runner';

/**
 * Renderbuffers store images in a "native" pixel format. They are faster to
 * use than textures; however, they cannot be read by shaders like textures. To
 * copy them to the canvas framebuffer or a texture, you must do a 'blit'
 * operation using `PIXI.FramebufferSystem`.
 *
 * A renderbuffer can be owned by only one renderer (and WebGL context); do not
 * rely on them for save data across different renderers.
 *
 * @namespace PIXI
 */
export class Renderbuffer
{
    /**
     * @param {number} width
     * @param {number} height
     * @param {number} [samples=0] - samples per pixel for multisampling
     * @param {PIXI.FORMATS} format - internal format
     */
    constructor(width, height, samples = 0, format = FORMATS.RGBA8)
    {
        this._width = width;
        this._height = height;
        this._samples = samples;
        this._internalFormat = format;

        /**
         * Flags any changes in properties.
         *
         * @member {number}
         * @protected
         */
        this.dirtyId = 0;

        /**
         * WebGL Renderbuffer object.
         */
        this.glRenderbuffer = null;

        /**
         * Runs when this renderbuffer is disposed.
         *
         * @member {PIXI.Runner}
         */
        this.disposeRunner = new Runner('disposeRenderbuffer', 2);

        /**
         * Fast way to check if this is a renderbuffer.
         *
         * @member {boolean}
         */
        this.isRenderbuffer = true;
    }

    /**
     * @member {number}
     */
    get width()
    {
        return this._width;
    }
    set width(value)
    {
        this._width = value;
        this.dirtyId++;
    }

    /**
     * @member {number}
     */
    get height()
    {
        return this._height;
    }
    set height(value)
    {
        this._height = value;
        this.dirtyId++;
    }

    /**
     * @member {PIXI.FORMATS}
     */
    get internalFormat()
    {
        return this._internalFormat;
    }
    set internalFormat(value)
    {
        this._internalFormat = value;
        this.dirtyId++;
    }

    /**
     * Whether multisampling is enabled for this renderbuffer. To enable
     * this, set `samples` to a positive value.
     *
     * NOTE: This feature is supported only on WebGL 2 machines. On WebGL
     * 1 machines, samples would be discarded.
     */
    get multisample()
    {
        return this._samples > 0;
    }

    /**
     * Samples per pixel for multisampling. This is best a integer power-of-2.
     *
     * @default 0
     * @member {number}
     */
    get samples()
    {
        return this._samples;
    }
    set samples(value)
    {
        this._samples = value;
        this.dirtyId++;
    }
}

/**
 * @namespace PIXI
 * @typedef {(PIXI.BaseTexture | PIXI.Renderbuffer)} ColorBuffer
 */
