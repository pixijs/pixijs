import { Bounds } from './bounds/Bounds';
import { Container } from './Container';

import type { PointData } from '../../maths/point/PointData';
import type { View } from '../../rendering/renderers/shared/view/View';

export class ViewContainer extends Container implements View
{
    public readonly canBundle = true;
    public renderPipeId: string;
    public allowChildren = false;

    public _roundPixels: 0 | 1 = 0;
    public _lastUsed = 0;
    public _lastInstructionTick = -1;
    public _didUpdateTickCompare = -1;
    public _didViewUpdate = false;

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

        if (point.x >= bounds.minX && point.x <= bounds.maxX)
        {
            if (point.y >= bounds.minY && point.y <= bounds.maxY)
            {
                return true;
            }
        }

        return false;
    }

    public onViewUpdate()
    {
        this._didChangeId += 1 << 12;
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
}
