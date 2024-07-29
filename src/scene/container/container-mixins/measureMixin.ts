import { Matrix } from '../../../maths/matrix/Matrix';
import { Bounds } from '../bounds/Bounds';
import { getGlobalBounds } from '../bounds/getGlobalBounds';
import { getLocalBounds } from '../bounds/getLocalBounds';
import { checkChildrenDidChange } from '../utils/checkChildrenDidChange';

import type { Size } from '../../../maths/misc/Size';
import type { Container } from '../Container';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface MeasureMixinConstructor
{
    width?: number;
    height?: number;
}
export interface MeasureMixin extends Required<MeasureMixinConstructor>
{
    getSize(out?: Size): Size;
    setSize(width: number, height?: number): void;
    setSize(value: Optional<Size, 'height'>): void;
    getLocalBounds(bounds?: Bounds): Bounds;
    getBounds(skipUpdate?: boolean, bounds?: Bounds): Bounds;
    _localBoundsCacheData: LocalBoundsCacheData;
    _localBoundsCacheId: number;
    _setWidth(width: number, localWidth: number): void;
    _setHeight(height: number, localHeight: number): void;
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

    _setWidth(value: number, localWidth: number)
    {
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

    _setHeight(value: number, localHeight: number)
    {
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

        if (localBoundsCacheData.data[0] !== this._didViewChangeTick)
        {
            localBoundsCacheData.didChange = true;
            localBoundsCacheData.data[0] = this._didViewChangeTick;
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
    },
} as Container;
