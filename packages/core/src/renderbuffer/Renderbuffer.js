import { FORMATS } from '@pixi/constants';
import { Runner } from '@pixi/runner';

export class Renderbuffer
{
    constructor(width, height, format = FORMATS.RGBA8)
    {
        this.width = width;
        this.height = height;
        this.internalFormat = format;

        /**
         * Flags any changes in properties.
         *
         * @member {number}
         * @protected
         */
        this.dirtyId = 0;

        /**
         * Map of the context UIDs to RBOs.
         *
         * @member {Map<number, object>}
         * @protected
         */
        this.glRenderbuffers = {};

        /**
         * Runs when this renderbuffer is disposed.
         */
        this.disposeRunner = new Runner('disposeRenderbuffer', 2);

        /**
         * Fast way to check if this is a renderbuffer.
         * @member {boolean}
         */
        this.isRenderbuffer = true;
    }

    get width()
    {
        return this._width;
    }
    set width(value)
    {
        this._width = value;
        this.dirtyId++;
    }

    get height()
    {
        return this._height;
    }
    set height(value)
    {
        this._height = value;
        this.dirtyId++;
    }

    get internalFormat()
    {
        return this._internalFormat;
    }
    set internalFormat(value)
    {
        this._internalFormat = value;
        this.dirtyId++;
    }
}

/**
 * @namespace PIXI
 * @typedef {(PIXI.BaseTexture | PIXI.Renderbuffer)} ColorBuffer
 */
