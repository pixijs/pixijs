import type { Point } from '../../../../maths/point/Point';
import type { BoundsData } from '../../../../scene/container/bounds/Bounds';

export interface ViewObserver
{
    onViewUpdate: () => void;
}

/**
 * A view is something that is able to be rendered by the renderer.
 * @memberof scene
 */
export interface View
{
    /** a unique id for this view */
    readonly uid: number;

    /** whether or not this view should be batched */
    batched: boolean;

    /**
     * an identifier that is used to identify the type of system that will be used to render this renderable
     * eg, 'sprite' will use the sprite system (based on the systems name
     */
    readonly renderPipeId: string;

    /** this is an int because it is packed directly into an attribute in the shader */
    _roundPixels: 0 | 1;

    /** @private */
    _lastUsed: number;
    /** @private */
    _lastInstructionTick: number

    /**
     *  Whether or not to round the x/y position of the object.
     * @type {boolean}
     */
    get roundPixels(): boolean;
    /** if true, the view will have its position rounded to the nearest whole number */
    set roundPixels(value: boolean);

    /** this is the AABB rectangle bounds of the view in local untransformed space. */
    bounds: BoundsData;

    /** Checks if the point is within the view */
    containsPoint: (point: Point) => boolean;
}

