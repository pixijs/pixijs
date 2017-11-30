/**
 * Base Texture resource class, manages validation and upload depends on its type.
 * upload is required.
 * @class
 * @memberof PIXI.resources
 */
export default class Resource
{
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
         * Reference to the parent base texture
         * @member {PIXI.BaseTexture}
         * @default null
         * @private
         */
        this._parent = null;

        /**
         * If resource has loaded
         * @member {boolean}
         * @readonly
         * @default false
         */
        this.loaded = false;

        /**
         * Promise when loading
         * @member {Promise}
         * @protected
         * @default null
         */
        this._load = null;

        /**
         * Optional string used to identify certain resources
         * @member {string}
         * @default null
         */
        this.tag = null;
    }

    /**
     * Reference to the parent base texture
     * @member {PIXI.BaseTexture}
     * @default null
     * @readonly
     */
    get parent()
    {
        return this._parent;
    }
    set parent(parent) // eslint-disable-line require-jsdoc
    {
        this._parent = parent;

        if (this.loaded)
        {
            this._validate();
        }
    }

    /**
     * Called when both BaseTexture and Resource are ready for work
     *
     * @protected
     */
    _validate()
    {
        this._parent.setRealSize(this.width, this.height);
    }

    /**
     * Extending classes should override this, start loading.
     *
     * @return {Promise} Handle load
     */
    load()
    {
        return Promise.resolve();
    }

    /**
     * The width of the resource.
     *
     * @member {number}
     * @readonly
     */
    get width()
    {
        return this._width;
    }

    /**
     * The height of the resource.
     *
     * @member {number}
     * @readonly
     */
    get height()
    {
        return this._height;
    }

    /**
     * Uploads the texture or returns false if it cant for some reason. Override this.
     *
     * @param {PIXI.Renderer} renderer - yeah, renderer!
     * @param {PIXI.BaseTexture} baseTexture - the texture
     * @param {PIXI.glCore.Texture} glTexture - texture instance for this webgl context
     * @returns {boolean} true is success
     */
    upload(/* renderer, baseTexture, glTexture*/)
    {
        // override
        return false;
    }

    /**
     * Set the style, optional to override
     *
     * @param {PIXI.Renderer} renderer - yeah, renderer!
     * @param {PIXI.BaseTexture} baseTexture - the texture
     * @param {PIXI.glCore.Texture} glTexture - texture instance for this webgl context
     * @returns {boolean} true is success
     */
    style(/* renderer, baseTexture, glTexture*/)
    {
        // override
    }

    /**
     * Call when destroying resource
     *
     * @param {PIXI.BaseTexture} [fromTexture] Base texture destroying resource
     * @return {boolean} `true` if the resource was destroyed
     */
    destroy(fromTexture)
    {
        if (this._parent === fromTexture && !this.destroyed)
        {
            this._parent = null;
            this.destroyed = true;

            return true;
        }

        return false;
    }
}
