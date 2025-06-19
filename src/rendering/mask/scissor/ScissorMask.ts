import { addMaskBounds } from '../utils/addMaskBounds';
import { addMaskLocalBounds } from '../utils/addMaskLocalBounds';

import type { Point } from '../../../maths/point/Point';
import type { Bounds } from '../../../scene/container/bounds/Bounds';
import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';

/**
 * ScissorMask is an effect that applies a scissor mask to a container.
 * It restricts rendering to the area defined by the mask.
 * The mask is a Container that defines the area to be rendered.
 * The mask must be a Container that is not renderable or measurable.
 * This effect is used to create clipping regions in the rendering process.
 * @category rendering
 * @advanced
 */
export class ScissorMask implements Effect
{
    public priority = 0;
    public mask: Container;
    public pipe = 'scissorMask';

    constructor(mask: Container)
    {
        this.mask = mask;

        this.mask.renderable = false;
        this.mask.measurable = false;
    }

    public addBounds(bounds: Bounds, skipUpdateTransform?: boolean): void
    {
        addMaskBounds(this.mask, bounds, skipUpdateTransform);
    }

    public addLocalBounds(bounds: Bounds, localRoot: Container): void
    {
        addMaskLocalBounds(this.mask, bounds, localRoot);
    }

    public containsPoint(point: Point, hitTestFn: (container: Container, point: Point) => boolean): boolean
    {
        const mask = this.mask as any;

        // if the point is in the mask, yay!
        return hitTestFn(mask, point);
    }

    public reset()
    {
        this.mask.measurable = true;
        this.mask = null;
    }

    public destroy(): void
    {
        this.reset();
    }
}
