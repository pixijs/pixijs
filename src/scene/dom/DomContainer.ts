import { Point } from '../../maths/point/Point';
import { ViewContainer, type ViewContainerOptions } from '../view/ViewContainer';

/**
 * Options for the {@link scene.DomContainer} constructor.
 * @memberof scene
 */
export interface DomContainerOptions extends ViewContainerOptions
{
    /** The DOM element to use for the container. */
    element?: HTMLElement;
}

/**
 * The DomContainer object is used to render DOM elements within the PixiJS scene graph.
 * It allows you to integrate HTML elements into your PixiJS application.
 *
 * ```js
 * import { DomContainer } from 'pixi.js';
 *
 * const element = document.createElement('div');
 * element.innerHTML = 'Hello World!';
 *
 * const domContainer = new DomContainer({ element });
 * ```
 * @memberof scene
 * @extends scene.ViewContainer
 */
export class DomContainer extends ViewContainer
{
    public override readonly renderPipeId: string = 'dom';

    public batched = false;
    public readonly anchor = new Point(0, 0);

    private _element: HTMLElement;

    /**
     * @param options - The options for creating the DOM container.
     */
    constructor(options: DomContainerOptions = {})
    {
        super({
            label: 'DomContainer',
            ...options
        });

        this.element = options.element || document.createElement('div');
        this.allowChildren = false;
    }

    set element(value: HTMLElement)
    {
        const currentElement = this._element;

        if (currentElement === value) return;

        this._element = value;
        this.onViewUpdate();
    }

    /** The DOM element that this container is using. */
    get element(): HTMLElement
    {
        return this._element;
    }

    /** @private */
    protected updateBounds()
    {
        const bounds = this._bounds;
        const element = this._element;

        if (!element)
        {
            bounds.minX = 0;
            bounds.minY = 0;
            bounds.maxX = 0;
            bounds.maxY = 0;

            return;
        }

        const { offsetWidth, offsetHeight } = element;

        bounds.minX = 0;
        bounds.maxX = offsetWidth;
        bounds.minY = 0;
        bounds.maxY = offsetHeight;
    }

    /**
     * Destroys this DOM container.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     */
    public override destroy(options: boolean = false)
    {
        super.destroy(options);

        if (this._element && this._element.parentNode)
        {
            this._element.parentNode.removeChild(this._element);
        }

        this._element = null;
    }
}
