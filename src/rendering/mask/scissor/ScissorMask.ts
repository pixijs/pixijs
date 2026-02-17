import { ExtensionType } from '../../../extensions/Extensions';
import { Rectangle } from '../../../maths/shapes/Rectangle';
import { type Container } from '../../../scene/container/Container';
import { Graphics } from '../../../scene/graphics/shared/Graphics';
import { addMaskBounds } from '../utils/addMaskBounds';
import { addMaskLocalBounds } from '../utils/addMaskLocalBounds';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { Point } from '../../../maths/point/Point';
import type { Bounds } from '../../../scene/container/bounds/Bounds';
import type { Effect } from '../../../scene/container/Effect';
import type { PoolItem } from '../../../utils/pool/Pool';

/**
 * ScissorMask is an effect that applies a scissor mask to a container.
 * It restricts rendering to the axis-aligned rectangular area defined by the mask.
 *
 * Scissor masks are significantly more performant than stencil masks because they
 * use the GPU's built-in scissor test rather than requiring extra draw calls to
 * write to and read from the stencil buffer.
 *
 * A scissor mask is automatically used when the mask is a Graphics object containing
 * a single filled rectangle with no rotation or skew applied.
 * @category rendering
 * @advanced
 */
export class ScissorMask implements Effect, PoolItem
{
    public static extension: ExtensionMetadata = {
        type: ExtensionType.MaskEffect,
        priority: 10,
    };

    public priority = 0;
    public mask: Container;
    public pipe = 'scissorMask';

    constructor(options?: { mask: Container })
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
        if (this.mask === null) return;
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
     * Tests whether a given mask value can be used as a scissor mask.
     *
     * A mask qualifies as a scissor mask when:
     * - It is a Graphics object
     * - Its GraphicsContext has exactly one fill instruction
     * - That fill instruction contains a single Rectangle shape primitive
     * - The rectangle has no local transform (or an identity transform)
     * @param mask - The mask value to test
     * @returns True if the mask can be used as a scissor mask
     */
    public static test(mask: any): boolean
    {
        if (!(mask instanceof Graphics)) return false;

        const context = mask.context;

        // Must have exactly one fill instruction
        if (!context || context.instructions.length !== 1) return false;

        const instruction = context.instructions[0];

        if (instruction.action !== 'fill') return false;

        const data = instruction.data;
        const path = data.path;

        if (!path) return false;

        const shapePath = path.shapePath;

        if (!shapePath) return false;

        const shapePrimitives = shapePath.shapePrimitives;

        // Must have exactly one shape primitive that is a rectangle
        if (!shapePrimitives || shapePrimitives.length !== 1) return false;

        const primitive = shapePrimitives[0];

        if (!primitive || !(primitive.shape instanceof Rectangle)) return false;

        // The shape must not have holes
        if (primitive.holes && primitive.holes.length > 0) return false;

        // If there is a local transform on the shape, it must be identity (no rotation/skew)
        if (primitive.transform && !primitive.transform.isIdentity())
        {
            const t = primitive.transform;

            // Allow pure translation/scale but not rotation/skew
            if (t.b !== 0 || t.c !== 0) return false;
        }

        return true;
    }
}
