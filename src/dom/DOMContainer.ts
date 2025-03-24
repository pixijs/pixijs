import { Point } from '../maths/point/Point';
import { ViewContainer, type ViewContainerOptions } from '../scene/view/ViewContainer';

import type { PointData } from '../maths/point/PointData';

/**
 * Options for the {@link scene.DOMContainer} constructor.
 * @memberof scene
 */
export interface DOMContainerOptions extends ViewContainerOptions
{
    /** The DOM element to use for the container. */
    element?: HTMLElement;
    /** The anchor point of the container. */
    anchor?: PointData | number;
}

/**
 * The DOMContainer object is used to render DOM elements within the PixiJS scene graph.
 * It allows you to integrate HTML elements into your PixiJS application.
 *
 * DOMContainer is especially useful for rendering standard DOM elements
 * that handle user input, such as `<input>` or `<textarea>`.
 * This is often simpler and more flexible than trying to implement text input
 * directly in PixiJS. For instance, if you need text fields or text areas,
 * you can embed them through this container for native browser text handling.
 *
 * --------- EXPERIMENTAL ---------
 *
 * This is a new API, things may change and it may not work as expected.
 * We want to hear your feedback as we go!
 *
 * --------------------------------
 * @example
 * ```js
 * import { DOMContainer } from 'pixi.js';
 *
 * const element = document.createElement('div');
 * element.innerHTML = 'Hello World!';
 *
 * const domContainer = new DOMContainer({ element });
 * ```
 * @memberof scene
 * @extends scene.ViewContainer
 */
export class DOMContainer extends ViewContainer<null>
{
    /** @private */
    public override readonly renderPipeId: string = 'dom';

    /** @private */
    public batched = false;
    /**
     * The anchor point of the container.
     * @private
     */
    public readonly _anchor: Point;

    /** The DOM element that this container is using. */
    private _element: HTMLElement;

    /**
     * @param options - The options for creating the DOM container.
     */
    constructor(options: DOMContainerOptions = {})
    {
        const { element, anchor, ...rest } = options;

        super({
            label: 'DOMContainer',
            ...rest
        });

        this._anchor = new Point(0, 0);

        if (anchor)
        {
            this.anchor = anchor;
        }

        this.element = options.element || document.createElement('div');
    }

    /**
     * The anchor sets the origin point of the container.
     * The default is `(0,0)`, this means the container's origin is the top left.
     *
     * Setting the anchor to `(0.5,0.5)` means the container's origin is centered.
     * Setting the anchor to `(1,1)` would mean the container's origin point will be the bottom right corner.
     *
     * If you pass only single parameter, it will set both x and y to the same value as shown in the example below.
     */
    get anchor(): Point
    {
        return this._anchor;
    }

    set anchor(value: PointData | number)
    {
        typeof value === 'number' ? this._anchor.set(value) : this._anchor.copyFrom(value);
    }

    set element(value: HTMLElement)
    {
        if (this._element === value) return;

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

        this._element?.parentNode?.removeChild(this._element);
        this._element = null;
        (this._anchor as null) = null;
    }
}
