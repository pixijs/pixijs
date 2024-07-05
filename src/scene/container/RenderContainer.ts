import { Bounds, type BoundsData } from './bounds/Bounds';
import { Container } from './Container';

import type { Point } from '../../maths/point/Point';
import type { Instruction } from '../../rendering/renderers/shared/instructions/Instruction';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { Renderer } from '../../rendering/renderers/types';
import type { ContainerOptions } from './Container';

type RenderFunction = (renderer: Renderer) => void;

/**
 * Options for the {@link scene.RenderContainer} constructor.
 * @memberof scene
 */
export interface RenderContainerOptions extends ContainerOptions
{
    /** the optional custom render function if you want to inject the function via the constructor */
    render?: RenderFunction;
    /** how to know if the custom render logic contains a point or not, used for interaction */
    containsPoint?: (point: Point) => boolean;
    /** how to add the bounds of this object when measuring */
    addBounds?: (bounds: BoundsData) => void;
}

/**
 * A container that allows for custom rendering logic. Its essentially calls the render function each frame
 * and allows for custom rendering logic - the render could be a WebGL renderer or WebGPU render or even a canvas render.
 * Its up to you to define the logic.
 *
 * This can be used in two ways, either by extending the class and overriding the render method,
 * or by passing a custom render function
 * @example
 * ```js
 * import { RenderContainer } from 'pixi.js';
 *
 * // extend the class
 * class MyRenderContainer extends RenderContainer
 * {
 *    render(renderer)
 *    {
 *      renderer.clear({
 *         clearColor: 'green', // clear the screen to green when rendering this item
 *      });
 *   }
 * }
 *
 * // override the render method
 * const renderContainer = new RenderContainer(
 * (renderer) =>  {
 *     renderer.clear({
 *       clearColor: 'green', // clear the screen to green when rendering this item
 *     });
 * })
 * ```
 * @memberof scene
 * @extends scene.Container
 */
export class RenderContainer extends Container implements View, Instruction
{
    public batched = false;
    /**
     *  Whether or not to round the x/y position of the sprite.
     * @type {boolean}
     */
    public roundPixels: boolean;
    public _roundPixels: 0 | 1;

    public _lastUsed = 0;
    public _lastInstructionTick = -1;

    /**
     * The local bounds of the sprite.
     * @type {rendering.Bounds}
     */
    public bounds = new Bounds();
    /**
     * Checks if the object contains the given point.
     * @param point - The point to check
     */
    public containsPoint: (point: Point) => boolean;
    /**
     * Adds the bounds of this text to the bounds object.
     * @param bounds - The output bounds object.
     */
    public addBounds: (bounds: Bounds) => void;

    public canBundle = false;
    public renderPipeId = 'customRender';

    /**
     * @param options - The options for the container.
     */
    constructor(options: RenderContainerOptions | RenderFunction)
    {
        if (typeof options === 'function')
        {
            options = { render: options };
        }

        const { render, ...rest } = options;

        super({
            label: 'RenderContainer',
            ...rest,
        });

        if (render) this.render = render;

        this.containsPoint = options.containsPoint ?? (() => false);
        this.addBounds = options.addBounds ?? (() => false);
    }

    /**
     * An overridable function that can be used to render the object using the current renderer.
     * @param _renderer - The current renderer
     */
    public render(_renderer: Renderer): void
    {
        // override me!
    }
}
