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
         * Resource has been valid already.
         * @protected
         * @default false
         */
        this._valid = false;

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
         * Mini-runner for handling valid events
         *
         * @member {Runner}
         */
        this.onValid = new Runner('validated');
    }

    /**
     * Bind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    bind(baseTexture)
    {
        this.onRealSize.add(baseTexture);
        this.onUpdate.add(baseTexture);
        this.onValid.add(baseTexture);

        // Call a resize immediate if we already
        // have the width and height of the resource
        if (this._width || this._height)
        {
            this.onRealSize.run(this._width, this._height);
        }

        // We are valid or not
        if (this._valid)
        {
            this.onValid.run();
        }
    }

    /**
     * Unbind to a parent BaseTexture
     *
     * @param {PIXI.BaseTexture} baseTexture - Parent texture
     */
    unbind(baseTexture)
    {
        this.onRealSize.remove(baseTexture);
        this.onUpdate.remove(baseTexture);
        this.onValid.remove(baseTexture);
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
     * Has been validated
     */
    set valid(valid)
    {
        this._valid = valid;

        if (!this.destroyed && valid)
        {
            this.onValid.run();
        }
    }
    get valid()
    {
        return this._valid;
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
     * This can be overriden to start preloading a resource
     * or do any other prepare step.
     * @protected
     * @return {Promise} Handle the validate event
     */
    validate()
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
    upload(renderer, baseTexture, glTexture) // eslint-disable-line no-unused-vars
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
    style(renderer, baseTexture, glTexture) // eslint-disable-line no-unused-vars
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
        this.onRealSize.removeAll();
        this.onRealSize = null;
        this.onUpdate.removeAll();
        this.onUpdate = null;
        this.onValid.removeAll();
        this.onValid = null;
        this.destroyed = true;
        this.dispose();
    }
}
