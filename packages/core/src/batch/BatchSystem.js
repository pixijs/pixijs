import System from '../System';
import ObjectRenderer from './ObjectRenderer';

/**
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
export default class BatchSystem extends System
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this manager works for.
     */
    constructor(renderer)
    {
        super(renderer);

        /**
         * An empty renderer.
         *
         * @member {PIXI.ObjectRenderer}
         */
        this.emptyRenderer = new ObjectRenderer(renderer);

        /**
         * The currently active ObjectRenderer.
         *
         * @member {PIXI.ObjectRenderer}
         */
        this.currentRenderer = this.emptyRenderer;
    }

    /**
     * Changes the current renderer to the one given in parameter
     *
     * @param {PIXI.ObjectRenderer} objectRenderer - The object renderer to use.
     */
    setObjectRenderer(objectRenderer)
    {
        if (this.currentRenderer === objectRenderer)
        {
            return;
        }

        this.currentRenderer.stop();
        this.currentRenderer = objectRenderer;

        this.renderer.state.setState(objectRenderer.state);

        this.currentRenderer.start();
    }

    /**
     * This should be called if you wish to do some custom rendering
     * It will basically render anything that may be batched up such as sprites
     *
     */
    flush()
    {
        this.setObjectRenderer(this.emptyRenderer);
    }

    reset()
    {
        this.setObjectRenderer(this.emptyRenderer);
    }
}
