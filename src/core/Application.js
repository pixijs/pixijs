import { autoDetectRenderer } from './autoDetectRenderer';
import Container from './display/Container';
import Ticker from './ticker/Ticker';

/**
 * Convenience class to create a new PIXI application.
 * This class automatically creates the renderer, ticker
 * and root container.
 *
 * @example
 * // Create the application
 * const app = new PIXI.Application();
 *
 * // Add the view to the DOM
 * document.body.appendChild(app.view);
 *
 * // ex, add display objects
 * app.stage.addChild(PIXI.Sprite.fromImage('something.png'));
 *
 * @class
 * @memberof PIXI
 */
export default class Application
{
    /**
     * @param {number} [width=800] - the width of the renderers view
     * @param {number} [height=600] - the height of the renderers view
     * @param {object} [options] - The optional renderer parameters
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
     * @param {boolean} [options.antialias=false] - sets antialias (only applicable in chrome at the moment)
     * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation, enable this if you
     *      need to call toDataUrl on the webgl context
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer, retina would be 2
     * @param {boolean} [noWebGL=false] - prevents selection of WebGL renderer, even if such is present
     */
    constructor(width, height, options, noWebGL)
    {
        /**
         * WebGL renderer if available, otherwise CanvasRenderer
         * @member {PIXI.WebGLRenderer|PIXI.CanvasRenderer}
         */
        this.renderer = autoDetectRenderer(width, height, options, noWebGL);

        /**
         * The root display container that's renderered.
         * @member {PIXI.Container}
         */
        this.stage = new Container();

        /**
         * Ticker for doing render updates.
         * @member {PIXI.ticker.Ticker}
         */
        this.ticker = new Ticker();

        this.ticker.add(this.render, this);

        // Start the rendering
        this.start();
    }

    /**
     * Render the current stage.
     */
    render()
    {
        this.renderer.render(this.stage);
    }

    /**
     * Convenience method for stopping the render.
     */
    stop()
    {
        this.ticker.stop();
    }

    /**
     * Convenience method for starting the render.
     */
    start()
    {
        this.ticker.start();
    }

    /**
     * Reference to the renderer's canvas element.
     * @member {HTMLCanvasElement}
     * @readonly
     */
    get view()
    {
        return this.renderer.view;
    }

    /**
     * Destroy and don't use after this.
     * @param {Boolean} [removeView=false] Automatically remove canvas from DOM.
     */
    destroy(removeView)
    {
        this.stop();
        this.ticker.remove(this.render, this);
        this.ticker = null;

        this.stage.destroy();
        this.stage = null;

        this.renderer.destroy(removeView);
        this.renderer = null;
    }
}
