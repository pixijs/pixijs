import { Runner } from '@pixi/runner';

import type { BaseTexture } from '../BaseTexture';
import type { Renderer } from '../../Renderer';
import type { GLTexture } from '../GLTexture';

/**
 * Base resource class for textures that manages validation and uploading, depending on its type.
 *
 * Uploading of a base texture to the GPU is required.
 *
 * @class
 * @memberof PIXI.resources
 */
export abstract class Resource
{
    public destroyed: boolean;
    public internal: boolean;
    protected _width: number;
    protected _height: number;
    protected onResize: Runner;
    protected onUpdate: Runner;
    protected onError: Runner;
    /**
     * @param {number} [width=0] Width of the resource
     * @param {number} [height=0] Height of the resource
     */
    constructor(width = 0, height = 0)
    {
        /**
         * Internal width of the resource
         * @member {number}
         * @protected
         */
        this._width = width;

        /**
         * Internal height of the resource
         * @member {number}
         * @protected
         */
        this._height = height;

        /**
         * If resource has been destroyed
         * @member {boolean}
         * @readonly
         * @default false
         */
        this.destroyed = false;

        /**
         * `true` if resource is created by BaseTexture
         * useful for doing cleanup with BaseTexture destroy
         * and not cleaning up resources that were created
         * externally.
         * @member {boolean}
         * @protected
         */
        this.internal = false;

        /**
         * Mini-runner for handling resize events
         * accepts 2 parameters: width, height
         *
         * @member {Runner}
         * @private
         */
        this.onResize = new Runner('setRealSize');

        /**
         * Mini-runner for handling update events
         *
         * @member {Runner}
         * @private
         */
        this.onUpdate = new Runner('update');

        /**
         * Handle internal errors, such as loading errors
         * accepts 1 param: error
         *
         * @member {Runner}
         * @private
         */
        this.onError = new Runner('onError');
    }

    /**
     * Bind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    bind(baseTexture: BaseTexture): void
    {
        this.onResize.add(baseTexture);
        this.onUpdate.add(baseTexture);
        this.onError.add(baseTexture);

        // Call a resize immediate if we already
        // have the width and height of the resource
        if (this._width || this._height)
        {
            this.onResize.emit(this._width, this._height);
        }
    }

    /**
     * Unbind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    unbind(baseTexture: BaseTexture): void
    {
        this.onResize.remove(baseTexture);
        this.onUpdate.remove(baseTexture);
        this.onError.remove(baseTexture);
    }

    /**
     * Trigger a resize event
     * @param {number} width X dimension
     * @param {number} height Y dimension
     */
    resize(width: number, height: number): void
    {
        if (width !== this._width || height !== this._height)
        {
            this._width = width;
            this._height = height;
            this.onResize.emit(width, height);
        }
    }

    /**
     * Has been validated
     * @readonly
     * @member {boolean}
     */
    get valid(): boolean
    {
        return !!this._width && !!this._height;
    }

    /**
     * Has been updated trigger event
     */
    update(): void
    {
        if (!this.destroyed)
        {
            this.onUpdate.emit();
        }
    }

    /**
     * This can be overridden to start preloading a resource
     * or do any other prepare step.
     * @protected
     * @return {Promise<void>} Handle the validate event
     */
    load(): Promise<Resource>
    {
        return Promise.resolve(this);
    }

    /**
     * The width of the resource.
     *
     * @member {number}
     * @readonly
     */
    get width(): number
    {
        return this._width;
    }

    /**
     * The height of the resource.
     *
     * @member {number}
     * @readonly
     */
    get height(): number
    {
        return this._height;
    }

    /**
     * Uploads the texture or returns false if it cant for some reason. Override this.
     *
     * @param {PIXI.Renderer} renderer - yeah, renderer!
     * @param {PIXI.BaseTexture} baseTexture - the texture
     * @param {PIXI.GLTexture} glTexture - texture instance for this webgl context
     * @returns {boolean} true is success
     */
    abstract upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean;

    /**
     * Set the style, optional to override
     *
     * @param {PIXI.Renderer} renderer - yeah, renderer!
     * @param {PIXI.BaseTexture} baseTexture - the texture
     * @param {PIXI.GLTexture} glTexture - texture instance for this webgl context
     * @returns {boolean} `true` is success
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    /* eslint-disable @typescript-eslint/ban-ts-ignore */
    // @ts-ignore
    style(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean
    {
        return false;
    }
    /* eslint-enable @typescript-eslint/no-unused-vars */
    /* eslint-enable @typescript-eslint/ban-ts-ignore */

    /**
     * Clean up anything, this happens when destroying is ready.
     *
     * @protected
     */
    dispose(): void
    {
        // override
    }

    /**
     * Call when destroying resource, unbind any BaseTexture object
     * before calling this method, as reference counts are maintained
     * internally.
     */
    destroy(): void
    {
        if (!this.destroyed)
        {
            this.destroyed = true;
            this.dispose();
            this.onError.removeAll();
            this.onError = null;
            this.onResize.removeAll();
            this.onResize = null;
            this.onUpdate.removeAll();
            this.onUpdate = null;
        }
    }

    /**
     * Abstract, used to auto-detect resource type
     *
     * @static
     * @param {*} source - The source object
     * @param {string} extension - The extension of source, if set
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    /* eslint-disable @typescript-eslint/ban-ts-ignore */
    // @ts-ignore
    static test(source: any, extension?: string): boolean
    {
        return false;
    }
    /* eslint-enable @typescript-eslint/no-unused-vars */
    /* eslint-enable @typescript-eslint/ban-ts-ignore */
}
