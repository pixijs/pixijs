import Runner from 'mini-runner';

/**
 * Base Texture resource class, manages validation and upload depends on its type.
 * upload is required.
 * @class
 * @memberof PIXI.resources
 */
export default class Resource
{
    /**
     * @param {object} [options] Options to use
     * @param {number} [options.width=0] Width of the resource
     * @param {number} [options.height=0] Height of the resource
     */
    constructor(options)
    {
        options = Object.assign({
            width: 0,
            height: 0,
        }, options);

        /**
         * Internal width of the resource
         * @member {number}
         * @protected
         */
        this._width = options.width;

        /**
         * Internal height of the resource
         * @member {number}
         * @protected
         */
        this._height = options.height;

        /**
         * If resource has been destroyed
         * @member {boolean}
         * @readonly
         * @default false
         */
        this.destroyed = false;

        /**
         * Number of reference counts where this resource is used.
         * @member {number}
         * @readonly
         * @default 0
         * @private
         */
        this.refs = 0;

        /**
         * Promise when loading
         * @member {Promise}
         * @protected
         * @default null
         */
        this._load = null;

        /**
         * Resource has been loaded already.
         * @protected
         * @default false
         */
        this._loaded = false;

        /**
         * Optional paramers used for dynamic or shared resources
         * @member {object}
         * @default null
         */
        // this.params = null;

        /**
         * Mini-runner for handling resize events
         *
         * @member {Runner}
         */
        this.onRealSize = new Runner('setRealSize', 2);

        /**
         * Mini-runner for handling update events
         *
         * @member {Runner}
         */
        this.onUpdate = new Runner('update');

        /**
         * Mini-runner for handling loaded events
         *
         * @member {Runner}
         */
        this.onLoaded = new Runner('loaded');
    }

    /**
     * Bind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    bind(baseTexture)
    {
        this.ref++;
        // this.params = baseTexture.params;
        this.onRealSize.add(baseTexture);
        this.onUpdate.add(baseTexture);
        this.onLoaded.add(baseTexture);

        // Call a resize immediate if we already
        // have the width and height of the resource
        if (this._width || this._height)
        {
            this.onRealSize.run(this._width, this._height);
        }

        // We are loaded or not
        if (this._loaded)
        {
            this.onLoaded.run();
        }
    }

    /**
     * Unbind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    unbind(baseTexture)
    {
        this.ref--;
        // this.params = null;
        this.onRealSize.remove(baseTexture);
        this.onUpdate.remove(baseTexture);
        this.onLoaded.remove(baseTexture);
    }

    /**
     * Trigger a resize event
     */
    resize(width, height)
    {
        if (width !== this._width || height !== this._height)
        {
            this._width = width;
            this._height = height;
            this.onRealSize.run(width, height);
        }
    }

    /**
     * Has been loaded
     */
    set loaded(loaded)
    {
        this._loaded = loaded;

        if (!this.destroyed && loaded)
        {
            this.onLoaded.run();
        }
    }
    get loaded()
    {
        return this._loaded;
    }

    /**
     * Has been updated trigger event
     */
    update()
    {
        if (!this.destroyed)
        {
            this.onUpdate.run();
        }
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
     * Clean up anything, this happens when destroying is ready.
     *
     * @protected
     */
    dispose()
    {
        // override
    }

    /**
     * Call when destroying resource, unbind any BaseTexture object
     * before calling this method, as reference counts are maintained
     * internally.
     */
    destroy()
    {
        if (!this.refs)
        {
            this.onRealSize.removeAll();
            this.onRealSize = null;
            this.onUpdate.removeAll();
            this.onUpdate = null;
            this.onLoaded.removeAll();
            this.onLoaded = null;
            this.destroyed = true;
            this.dispose();
        }
    }
}
