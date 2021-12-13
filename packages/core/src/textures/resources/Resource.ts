import { Runner } from '@pixi/runner';

import type { BaseTexture } from '../BaseTexture';
import type { Renderer } from '../../Renderer';
import type { GLTexture } from '../GLTexture';

/**
 * Base resource class for textures that manages validation and uploading, depending on its type.
 *
 * Uploading of a base texture to the GPU is required.
 *
 * @memberof PIXI
 */
export abstract class Resource
{
    /**
     * If resource has been destroyed.
     *
     * @readonly
     * @default false
     */
    public destroyed: boolean;

    /**
     * `true` if resource is created by BaseTexture
     * useful for doing cleanup with BaseTexture destroy
     * and not cleaning up resources that were created
     * externally.
     */
    public internal: boolean;

    /** Internal width of the resource. */
    protected _width: number;

    /** Internal height of the resource. */
    protected _height: number;

    /**
     * Mini-runner for handling resize events
     * accepts 2 parameters: width, height
     *
     * @member {Runner}
     * @private
     */
    protected onResize: Runner; // TODO: Should this be private? It doesn't seem to be used anywhere else.

    /**
     * Mini-runner for handling update events
     *
     * @member {Runner}
     * @private
     */
    protected onUpdate: Runner;

    /**
     * Handle internal errors, such as loading errors
     * accepts 1 param: error
     *
     * @member {Runner}
     * @private
     */
    protected onError: Runner;

    /**
     * @param width - Width of the resource
     * @param height - Height of the resource
     */
    constructor(width = 0, height = 0)
    {
        this._width = width;
        this._height = height;

        this.destroyed = false;
        this.internal = false;

        this.onResize = new Runner('setRealSize');
        this.onUpdate = new Runner('update');
        this.onError = new Runner('onError');
    }

    /**
     * Bind to a parent BaseTexture
     *
     * @param baseTexture - Parent texture
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
     * @param baseTexture - Parent texture
     */
    unbind(baseTexture: BaseTexture): void
    {
        this.onResize.remove(baseTexture);
        this.onUpdate.remove(baseTexture);
        this.onError.remove(baseTexture);
    }

    /**
     * Trigger a resize event
     *
     * @param width - X dimension
     * @param height - Y dimension
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
     *
     * @readonly
     */
    get valid(): boolean
    {
        return !!this._width && !!this._height;
    }

    /** Has been updated trigger event. */
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
     *
     * @protected
     * @return Handle the validate event
     */
    load(): Promise<Resource>
    {
        return Promise.resolve(this);
    }

    /**
     * The width of the resource.
     *
     * @readonly
     */
    get width(): number
    {
        return this._width;
    }

    /**
     * The height of the resource.
     *
     * @readonly
     */
    get height(): number
    {
        return this._height;
    }

    /**
     * Uploads the texture or returns false if it cant for some reason. Override this.
     *
     * @param renderer - yeah, renderer!
     * @param baseTexture - the texture
     * @param glTexture - texture instance for this webgl context
     * @returns - true is success
     */
    abstract upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean;

    /**
     * Set the style, optional to override
     *
     * @param renderer - yeah, renderer!
     * @param baseTexture - the texture
     * @param glTexture - texture instance for this webgl context
     * @returns - `true` is success
     */
    style(_renderer: Renderer, _baseTexture: BaseTexture, _glTexture: GLTexture): boolean
    {
        return false;
    }

    /** Clean up anything, this happens when destroying is ready. */
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
     * Abstract, used to auto-detect resource type.
     *
     * @param {*} source - The source object
     * @param {string} extension - The extension of source, if set
     */
    static test(_source: unknown, _extension?: string): boolean
    {
        return false;
    }
}
