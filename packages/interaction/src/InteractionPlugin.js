import { InteractionManager } from '@pixi/interaction';

/**
 * Middleware for for Application's InteractionManager
 * @private
 * @class
 */
export default class InteractionPlugin
{
    /**
     * Initialize the plugin with scope of application instance
     * @static
     * @private
     * @param {object} [options] - See application options
     */
    static init(options)
    {
        options = Object.assign({
            interaction: true,
            autoPreventDefault: true,
            interactionFrequency: 10,
        }, options);

        /**
         * InteractionManager for the application
         * @member {PIXI.interaction.InteractionManager} interaction
         * @memberof PIXI.Application#
         */
        this.interaction = null;

        // Default is to opt-in to interaction
        if (options.interaction)
        {
            const { autoPreventDefault, interactionFrequency } = options;

            this.interaction = new InteractionManager({
                root: this.stage,
                ticker: this.ticker,
                view: this.view,
                resolution: this.renderer.resolution,
                autoPreventDefault,
                interactionFrequency,
            });
        }
    }

    /**
     * Clean up the ticker, scoped to application
     * @static
     * @private
     */
    static destroy()
    {
        if (this.interaction)
        {
            this.interaction.destroy();
        }
        this.interaction = null;
    }
}
