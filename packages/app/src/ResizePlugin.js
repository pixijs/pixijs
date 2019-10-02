/**
 * Middleware for for Application's resize functionality
 * @private
 * @class
 */
export class ResizePlugin
{
    /**
     * Initialize the plugin with scope of application instance
     * @static
     * @private
     * @param {object} [options] - See application options
     */
    static init(options)
    {
        /**
         * The element or window to resize the application to.
         * @type {Window|HTMLElement}
         * @name resizeTo
         * @memberof PIXI.Application#
         */
        Object.defineProperty(this, 'resizeTo',
            {
                set(dom)
                {
                    window.removeEventListener('resize', this.resize);
                    this._resizeTo = dom;
                    if (dom)
                    {
                        window.addEventListener('resize', this.resize);
                        this.resize();
                    }
                },
                get()
                {
                    return this._resizeTo;
                },
            });

        /**
         * If `resizeTo` is set, calling this function
         * will resize to the width and height of that element.
         * @method PIXI.Application#resize
         */
        this.resize = () =>
        {
            if (this._resizeTo)
            {
                // Resize to the window
                if (this._resizeTo === window)
                {
                    this.renderer.resize(
                        window.innerWidth,
                        window.innerHeight
                    );
                }
                // Resize to other HTML entities
                else
                {
                    this.renderer.resize(
                        this._resizeTo.clientWidth,
                        this._resizeTo.clientHeight
                    );
                }
            }
        };

        // On resize
        this._resizeTo = null;
        this.resizeTo = options.resizeTo || null;
    }

    /**
     * Clean up the ticker, scoped to application
     * @static
     * @private
     */
    static destroy()
    {
        this.resizeTo = null;
        this.resize = null;
    }
}
