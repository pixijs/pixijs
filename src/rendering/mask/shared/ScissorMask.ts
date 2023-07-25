import { addMaskBounds } from './addMaskBounds';
import { addMaskLocalBounds } from './addMaskLocalBounds';

import type { PointData } from '../../../maths/PointData';
import type { Bounds } from '../../scene/bounds/Bounds';
import type { Container } from '../../scene/Container';
import type { Effect } from '../../scene/Effect';

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

    public containsPoint(point: PointData): boolean
    {
        const mask = this.mask as any;

        if (mask.containsPoint)
        {
            return mask.containsPoint(point);
        }

        return false;
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
