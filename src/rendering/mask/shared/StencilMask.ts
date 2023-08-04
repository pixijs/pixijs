import { ExtensionType } from '../../../extensions/Extensions';
import { Container } from '../../scene/Container';
import { addMaskBounds } from './addMaskBounds';
import { addMaskLocalBounds } from './addMaskLocalBounds';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Point } from '../../../maths/Point';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { Bounds } from '../../scene/bounds/Bounds';
import type { Effect } from '../../scene/Effect';

export class StencilMask implements Effect, PoolItem
{
    public static extension: ExtensionMetadata = ExtensionType.MaskEffect;

    public priority = 0;
    public mask: Container;
    public pipe = 'stencilMask';

    constructor(options: {mask: Container})
    {
        if (options?.mask)
        {
            this.init(options.mask);
        }
    }

    public init(mask: Container): void
    {
        this.mask = mask;
        this.mask.includeInBuild = false;
        this.mask.measurable = false;
    }

    public reset()
    {
        this.mask.measurable = true;
        this.mask.includeInBuild = true;
        this.mask = null;
    }

    public addBounds(bounds: Bounds, skipUpdateTransform: boolean): void
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

    public destroy(): void
    {
        this.reset();
    }

    public static test(mask: any): boolean
    {
        return mask instanceof Container;
    }
}
