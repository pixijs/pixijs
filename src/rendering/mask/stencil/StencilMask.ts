import { ExtensionType } from '../../../extensions/Extensions';
import { Container } from '../../../scene/container/Container';
import { addMaskBounds } from '../utils/addMaskBounds';
import { addMaskLocalBounds } from '../utils/addMaskLocalBounds';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Point } from '../../../maths/point/Point';
import type { Bounds } from '../../../scene/container/bounds/Bounds';
import type { Effect } from '../../../scene/container/Effect';
import type { PoolItem } from '../../../utils/pool/Pool';

const typeSymbol = Symbol.for('pixijs.StencilMask');

/**
 * A mask that uses the stencil buffer to clip the rendering of a container.
 * This is useful for complex masks that cannot be achieved with simple shapes.
 * It is more performant than using a `Graphics` mask, but requires WebGL support.
 * It is also useful for masking with `Container` objects that have complex shapes.
 * @category rendering
 * @advanced
 */
export class StencilMask implements Effect, PoolItem
{
    /**
     * Type symbol used to identify instances of StencilMask.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a StencilMask.
     * @param obj - The object to check.
     * @returns True if the object is a StencilMask, false otherwise.
     */
    public static isStencilMask(obj: any): obj is StencilMask
    {
        return !!obj && !!obj[typeSymbol];
    }

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
