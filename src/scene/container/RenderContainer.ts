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
    /** the custom render function */
    render: RenderFunction;
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
 * ```js
 * import { RenderContainer } from 'pixi.js';
 *
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
    public roundPixels: boolean;
    public _roundPixels: 0 | 1;

    public bounds = new Bounds();
    public containsPoint: (point: Point) => boolean;
    public addBounds: (bounds: Bounds) => void;

    public canBundle = false;
    public renderPipeId = 'customRender';
    public render: RenderFunction;

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

        this.render = render;
        this.containsPoint = options.containsPoint ?? (() => false);
        this.addBounds = options.addBounds ?? (() => false);
    }
}
