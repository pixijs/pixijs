import type { Point } from '../../../../maths/point/Point';
import type { Bounds, BoundsData } from '../../../../scene/container/bounds/Bounds';

export interface ViewObserver
{
    onViewUpdate: () => void;
}

export interface View
{
    uid: number;

    batched: boolean;

    /**
     * an identifier that is used to identify the type of system that will be used to render this renderable
     * eg, 'sprite' will use the sprite system (based on the systems name
     */
    renderPipeId: string;

    /**
     * this is an int because it is packed directly into an attribute in the shader
     * @internal
     */
    _roundPixels?: 0 | 1;

    /** this is the AABB rectangle bounds of the view in local untransformed space. */
    bounds: BoundsData;

    addBounds: (bounds: Bounds) => void;
    containsPoint: (point: Point) => boolean;
}

