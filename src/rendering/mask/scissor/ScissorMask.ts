import { ExtensionType } from '../../../extensions/Extensions';
import { Graphics } from '../../../scene/graphics/shared/Graphics';
import { addMaskBounds } from '../utils/addMaskBounds';
import { addMaskLocalBounds } from '../utils/addMaskLocalBounds';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Point } from '../../../maths/point/Point';
import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { Bounds } from '../../../scene/container/bounds/Bounds';
import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { PoolItem } from '../../../utils/pool/Pool';

/**
 * ScissorMask is an effect that applies a scissor mask to a container.
 * It restricts rendering to the axis-aligned rectangular area defined by the mask,
 * using the GPU scissor test instead of the stencil buffer. This is significantly
 * more performant than a stencil mask as it avoids extra draw calls.
 *
 * A scissor mask is automatically used when the mask is a {@link Graphics} object
 * containing a single rectangle fill with no rotation or skew.
 * @category rendering
 * @advanced
 */
export class ScissorMask implements Effect, PoolItem
{
    public static extension: ExtensionMetadata = {
        type: ExtensionType.MaskEffect,
        priority: 1,
    };

    public priority = 0;
    public mask: Container | null = null;
    public pipe = 'scissorMask';

    constructor(options?: {mask: Container})
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

    public reset(): void
    {
        if (!this.mask) return;
        this.mask.measurable = true;
        this.mask.includeInBuild = true;
        this.mask = null;
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

    public destroy(): void
    {
        this.reset();
    }

    /**
     * Tests if the given mask can be used as a scissor mask.
     * A scissor mask requires:
     * - The mask is a Graphics object
     * - The Graphics has a single fill instruction with a rectangle shape
     * - The Graphics transform is axis-aligned (no rotation or skew)
     * @param mask - The mask to test
     * @returns true if the mask can be used as a scissor mask
     */
    public static test(mask: any): boolean
    {
        if (!(mask instanceof Graphics)) return false;

        // Check that the mask's world transform is axis-aligned (no rotation or skew)
        const wt = mask.worldTransform;

        if (wt.b !== 0 || wt.c !== 0) return false;

        const context = mask.context;

        // Check if context has instructions
        if (!context || !context.instructions || context.instructions.length !== 1)
        {
            return false;
        }

        const instruction = context.instructions[0];

        // Must be a fill instruction (not stroke/texture)
        if (instruction.action !== 'fill') return false;

        const data = instruction.data;

        if (!data?.path?.shapePath?.shapePrimitives) return false;

        const shapePrimitives = data.path.shapePath.shapePrimitives;

        // Must have exactly one shape primitive with no holes
        if (shapePrimitives.length !== 1) return false;

        const primitive = shapePrimitives[0];

        if (!primitive?.shape || primitive.shape.type !== 'rectangle') return false;

        // Check that there are no holes
        if (primitive.holes && primitive.holes.length > 0) return false;

        // Check that any local shape transform is axis-aligned
        if (primitive.transform && !primitive.transform.isIdentity())
        {
            const t = primitive.transform;

            if (t.b !== 0 || t.c !== 0) return false;
        }

        return true;
    }

    /**
     * Extracts the rectangle bounds from a scissor mask Graphics object in local space.
     * @param mask - The Graphics mask container
     * @returns The local rectangle of the mask shape, or null if not extractable
     */
    public static getLocalRect(mask: Container): Rectangle | null
    {
        if (!(mask instanceof Graphics)) return null;

        const context = mask.context;

        if (!context?.instructions?.length) return null;

        const instruction = context.instructions[0];

        if (instruction.action !== 'fill') return null;

        const shapePrimitives = instruction.data?.path?.shapePath?.shapePrimitives;

        if (!shapePrimitives?.length) return null;

        const shape = shapePrimitives[0].shape as Rectangle;

        return shape;
    }
}
