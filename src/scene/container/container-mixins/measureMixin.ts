import { Matrix } from '../../../maths/matrix/Matrix';
import { Bounds } from '../bounds/Bounds';
import { getGlobalBounds } from '../bounds/getGlobalBounds';
import { getLocalBounds } from '../bounds/getLocalBounds';
import { checkChildrenDidChange } from '../utils/checkChildrenDidChange';

import type { Container } from '../Container';

export interface MeasureMixinConstructor
{
    width?: number;
    height?: number;
}
export interface MeasureMixin extends Required<MeasureMixinConstructor>
{
    getLocalBounds(bounds?: Bounds): Bounds;
    getBounds(skipUpdate?: boolean, bounds?: Bounds): Bounds;
    _localBoundsCacheData: LocalBoundsCacheData;
    _localBoundsCacheId: number;

}

interface LocalBoundsCacheData
{
    data: number[];
    index: number;
    didChange: boolean;
    localBounds: Bounds;
}

const tempMatrix = new Matrix();

export const measureMixin: Partial<Container> = {

    _localBoundsCacheId: -1,
    _localBoundsCacheData: null,

    /**
     * The width of the Container, setting this will actually modify the scale to achieve the value set.
     * @memberof scene.Container#
     */
    get width(): number
    {
        return Math.abs(this.scale.x * this.getLocalBounds().width);
    },

    set width(value: number)
    {
        const localWidth = this.getLocalBounds().width;

        const sign = Math.sign(this.scale.x) || 1;

        if (localWidth !== 0)
        {
            this.scale.x = (value / localWidth) * sign;
        }
        else
        {
            this.scale.x = sign;
        }
    },

    /**
     * The height of the Container, setting this will actually modify the scale to achieve the value set.
     * @memberof scene.Container#
     */
    get height(): number
    {
        return Math.abs(this.scale.y * this.getLocalBounds().height);
    },

    set height(value: number)
    {
        const localHeight = this.getLocalBounds().height;

        const sign = Math.sign(this.scale.y) || 1;

        if (localHeight !== 0)
        {
            this.scale.y = (value / localHeight) * sign;
        }
        else
        {
            this.scale.y = sign;
        }
    },

    /**
     * Retrieves the local bounds of the container as a Bounds object.
     * @returns - The bounding area.
     * @memberof scene.Container#
     */
    getLocalBounds(): Bounds
    {
        if (!this._localBoundsCacheData)
        {
            this._localBoundsCacheData = {
                data: [],
                index: 1,
                didChange: false,
                localBounds: new Bounds()
            };
        }

        const localBoundsCacheData = this._localBoundsCacheData;

        localBoundsCacheData.index = 1;
        localBoundsCacheData.didChange = false;

        if (localBoundsCacheData.data[0] !== this._didChangeId >> 12)
        {
            localBoundsCacheData.didChange = true;
            localBoundsCacheData.data[0] = this._didChangeId >> 12;
        }

        checkChildrenDidChange(this, localBoundsCacheData);

        if (localBoundsCacheData.didChange)
        {
            getLocalBounds(this, localBoundsCacheData.localBounds, tempMatrix);
        }

        return localBoundsCacheData.localBounds;
    },

    /**
     * Calculates and returns the (world) bounds of the display object as a [Rectangle]{@link Rectangle}.
     * @param skipUpdate - Setting to `true` will stop the transforms of the scene graph from
     *  being updated. This means the calculation returned MAY be out of date BUT will give you a
     *  nice performance boost.
     * @param bounds - Optional bounds to store the result of the bounds calculation.
     * @returns - The minimum axis-aligned rectangle in world space that fits around this object.
     * @memberof scene.Container#
     */
    getBounds(skipUpdate?: boolean, bounds?: Bounds): Bounds
    {
        return getGlobalBounds(this, skipUpdate, bounds || new Bounds());
    }

} as Container;

