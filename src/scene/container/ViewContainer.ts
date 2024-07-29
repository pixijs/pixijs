import { Bounds } from './bounds/Bounds';
import { Container } from './Container';

import type { PointData } from '../../maths/point/PointData';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { BoundsData } from './bounds/Bounds';

export class ViewContainer extends Container implements View
{
    public readonly canBundle = true;
    public readonly renderPipeId: string;
    public allowChildren = false;

    public _roundPixels: 0 | 1 = 0;
    public _lastUsed = 0;
    public _lastInstructionTick = -1;

    /** @private */
    public didViewUpdate = true;

    protected _bounds: Bounds = new Bounds();
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

    /**
     *  Whether or not to round the x/y position of the sprite.
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

    public onViewUpdate()
    {
        this._didViewChangeTick++;
        this._boundsDirty = true;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.onChildViewUpdate(this);
        }
    }

    protected updateBounds()
    {
        // override me!
    }

    /**
     * @param _boundsData - the bounds to add this object bounds to
     * @deprecated since 8.2.5, please use updateBounds instead to ensure bounds are correctly updated
     */
    public addBounds(_boundsData: BoundsData)
    {
        // override me!
    }
}
