import { Bounds } from '../container/bounds/Bounds';
import { Container } from '../container/Container';

import type { PointData } from '../../maths/point/PointData';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { DestroyOptions } from '../container/destroyTypes';

/**
 * A ViewContainer is a type of container that represents a view.
 * This view can be a Sprite, a Graphics object, or any other object that can be rendered.
 * This class is abstract and should not be used directly.
 * @memberof scene
 */
export abstract class ViewContainer extends Container implements View
{
    /** @private */
    public override readonly renderPipeId: string;
    /** @private */
    public readonly canBundle = true;
    /** @private */
    public override allowChildren = false;

    /** @private */
    public _roundPixels: 0 | 1 = 0;
    /** @private */
    public _lastUsed = 0;
    /** @private */
    public _lastInstructionTick = -1;

    protected _bounds: Bounds = new Bounds(0, 1, 0, 0);
    protected _boundsDirty = true;

    /**
     * The local bounds of the view.
     * @type {rendering.Bounds}
     */
    public get bounds()
    {
        if (!this._boundsDirty) return this._bounds;

        this.updateBounds();

        this._boundsDirty = false;

        return this._bounds;
    }

    /** @private */
    protected abstract updateBounds(): void;

    /**
     * Whether or not to round the x/y position of the sprite.
     * @type {boolean}
     */
    get roundPixels()
    {
        return !!this._roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this._roundPixels = value ? 1 : 0;
    }

    /**
     * Checks if the object contains the given point.
     * @param point - The point to check
     */
    public containsPoint(point: PointData)
    {
        const bounds = this.bounds;
        const { x, y } = point;

        return (x >= bounds.minX
            && x <= bounds.maxX
            && y >= bounds.minY
            && y <= bounds.maxY);
    }

    /** @private */
    public abstract batched: boolean;

    /** @private */
    protected abstract onViewUpdate(): void;

    public override destroy(options?: DestroyOptions): void
    {
        super.destroy(options);

        this._bounds = null;
    }
}
