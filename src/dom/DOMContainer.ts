import { Point } from '../maths/point/Point';
import { ViewContainer, type ViewContainerOptions } from '../scene/view/ViewContainer';

import type { PointData } from '../maths/point/PointData';

/**
 * Options for configuring a {@link DOMContainer}.
 * Controls how DOM elements are integrated into the PixiJS scene graph.
 * @example
 * ```ts
 * // Create with a custom element
 * const domContainer = new DOMContainer({
 *     element: document.createElement('input'),
 *     anchor: { x: 0.5, y: 0.5 } // or anchor: 0.5 to center both x and y
 * });
 * ```
 * @category scene
 * @standard
 * @noInheritDoc
 */
export interface DOMContainerOptions extends ViewContainerOptions
{
    /**
     * The DOM element to use for the container.
     * Can be any HTML element like div, input, textarea, etc.
     *
     * If not provided, creates a new div element.
     * @default document.createElement('div')
     */
    element?: HTMLElement;

    /**
     * The anchor point of the container.
     * - Can be a single number to set both x and y
     * - Can be a point-like object with x,y coordinates
     * - (0,0) is top-left
     * - (1,1) is bottom-right
     * - (0.5,0.5) is center
     * @default 0
     */
    anchor?: PointData | number;
}

/**
 * The DOMContainer object is used to render DOM elements within the PixiJS scene graph.
 * It allows you to integrate HTML elements into your PixiJS application while maintaining
 * proper transform hierarchy and visibility.
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
 * @example
 * ```ts
 * // Basic text display
 * const textContainer = new DOMContainer();
 * textContainer.element.innerHTML = 'Hello World!';
 * app.stage.addChild(textContainer);
 *
 * // Input field with centered anchor
 * const inputContainer = new DOMContainer({
 *     element: document.createElement('input'),
 *     anchor: 0.5
 * });
 * inputContainer.position.set(400, 300);
 * app.stage.addChild(inputContainer);
 *
 * // Rich text area
 * const textArea = new DOMContainer({
 *     element: document.createElement('textarea'),
 *     anchor: { x: 0, y: 0 }
 * });
 * textArea.scale.set(2);
 * app.stage.addChild(textArea);
 * ```
 * @category scene
 * @standard
 */
export class DOMContainer extends ViewContainer<never>
{
    /** @internal */
    public override readonly renderPipeId: string = 'dom';

    /** @internal */
    public batched = false;
    /**
     * The anchor point of the container.
     * @internal
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
     * Controls the relative positioning of the DOM element.
     *
     * The default is `(0,0)`, this means the container's origin is the top left.
     * Setting the anchor to `(0.5,0.5)` means the container's origin is centered.
     * Setting the anchor to `(1,1)` would mean the container's origin point will be the bottom right corner.
     * @example
     * ```ts
     * const container = new DOMContainer();
     *
     * // Set anchor to center (shorthand)
     * container.anchor = 0.5;
     *
     * // Set anchor to bottom-right
     * container.anchor = { x: 1, y: 1 };
     *
     * // Set anchor to custom position
     * container.anchor = new Point(0.3, 0.7);
     * ```
     */
    get anchor(): Point
    {
        return this._anchor;
    }

    /**
     * Sets the anchor point of the container.
     * @param value - New anchor value:
     * - number: Sets both x and y to same value
     * - PointData: Sets x and y separately
     */
    set anchor(value: PointData | number)
    {
        typeof value === 'number' ? this._anchor.set(value) : this._anchor.copyFrom(value);
    }

    /**
     * Sets the DOM element for this container.
     * This will replace the current element and update the view.
     * @param value - The new DOM element to use
     * @example
     * ```ts
     * const domContainer = new DOMContainer();
     * domContainer.element = document.createElement('input');
     * ```
     */
    set element(value: HTMLElement)
    {
        if (this._element === value) return;

        this._element = value;
        this.onViewUpdate();
    }

    /**
     * The DOM element associated with this container.
     * @example
     * ```ts
     * const domContainer = new DOMContainer();
     * domContainer.element.innerHTML = 'Hello World!';
     * document.body.appendChild(domContainer.element);
     * ```
     */
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
     *  have been set to that
     * @example
     * domContainer.destroy();
     * domContainer.destroy(true);
     */
    public override destroy(options: boolean = false)
    {
        super.destroy(options);

        this._element?.parentNode?.removeChild(this._element);
        this._element = null;
        (this._anchor as null) = null;
    }
}
