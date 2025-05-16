import { Matrix } from '../../../maths/matrix/Matrix';
import { Bounds } from '../bounds/Bounds';
import { getGlobalBounds } from '../bounds/getGlobalBounds';
import { getLocalBounds } from '../bounds/getLocalBounds';
import { checkChildrenDidChange } from '../utils/checkChildrenDidChange';

import type { Size } from '../../../maths/misc/Size';
import type { Container } from '../Container';

/**
 * A utility type that makes all properties of T optional except for the specified keys K.
 * @category utils
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** @ignore */
export interface MeasureMixinConstructor
{
    width?: number;
    height?: number;
}
/**
 * The MeasureMixin interface provides methods for measuring and manipulating the size and bounds of a display object.
 * It includes methods to get and set the size of the object, retrieve its local bounds,
 * and calculate its global bounds.
 * @category scene
 */
export interface MeasureMixin extends Required<MeasureMixinConstructor>
{
    getSize(out?: Size): Size;
    setSize(width: number, height?: number): void;
    setSize(value: Optional<Size, 'height'>): void;
    /**
     * Retrieves the local bounds of the container as a Bounds object.
     * @returns - The bounding area.
     */
    getLocalBounds(bounds?: Bounds): Bounds;
    /**
     * Calculates and returns the (world) bounds of the display object as a {@link Rectangle}.
     * @param {boolean} [skipUpdate] - Setting to `true` will stop the transforms of the scene graph from
     *  being updated. This means the calculation returned MAY be out of date BUT will give you a
     *  nice performance boost.
     * @param {Bounds} [bounds] - Optional bounds to store the result of the bounds calculation.
     * @returns - The minimum axis-aligned rectangle in world space that fits around this object.
     */
    getBounds(skipUpdate?: boolean, bounds?: Bounds): Bounds;
    /** @private */
    _localBoundsCacheData: LocalBoundsCacheData;
    /** @private */
    _localBoundsCacheId: number;
    /** @private */
    _setWidth(width: number, localWidth: number): void;
    /** @private */
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

/** @internal */
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

    getBounds(skipUpdate?: boolean, bounds?: Bounds): Bounds
    {
        return getGlobalBounds(this, skipUpdate, bounds || new Bounds());
    },
} as Container;
