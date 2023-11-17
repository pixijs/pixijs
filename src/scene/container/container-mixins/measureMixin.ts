import { Matrix } from '../../../maths/matrix/Matrix';
import { Bounds } from '../bounds/Bounds';
import { getGlobalBounds } from '../bounds/getGlobalBounds';
import { getLocalBounds } from '../bounds/getLocalBounds';

import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { Container } from '../Container';

export interface MeasureMixinConstructor
{
    width?: number;
    height?: number;
}
export interface MeasureMixin extends Required<MeasureMixinConstructor>
{
    getLocalBounds(rect?: Rectangle): Rectangle;
    getBounds(skipUpdate?: boolean, rect?: Rectangle): Rectangle;
}

const tempBounds = new Bounds();
const tempMatrix = new Matrix();

export const measureMixin: Partial<Container> = {

    /**
     * The width of the Container, setting this will actually modify the scale to achieve the value set.
     * @memberof scene.Container#
     */
    get width(): number
    {
        return Math.abs(this.scale.x * getLocalBounds(this, tempBounds, tempMatrix).width);
    },

    set width(value: number)
    {
        const localWidth = getLocalBounds(this, tempBounds, tempMatrix).width;

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
        return Math.abs(this.scale.y * getLocalBounds(this, tempBounds, tempMatrix).height);
    },

    set height(value: number)
    {
        const localHeight = getLocalBounds(this, tempBounds, tempMatrix).height;

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
     * @param rect - Optional rectangle to store the result of the bounds calculation.
     * @returns - The bounding area.
     * @memberof scene.Container#
     */
    getLocalBounds(rect?: Rectangle): Rectangle
    {
        const bounds = getLocalBounds(this, new Bounds(), tempMatrix);

        return rect ? rect.copyFromBounds(bounds) : bounds.rectangle.clone();
    },

    /**
     * Calculates and returns the (world) bounds of the display object as a [Rectangle]{@link Rectangle}.
     * @param skipUpdate - Setting to `true` will stop the transforms of the scene graph from
     *  being updated. This means the calculation returned MAY be out of date BUT will give you a
     *  nice performance boost.
     * @param rect - Optional rectangle to store the result of the bounds calculation.
     * @returns - The minimum axis-aligned rectangle in world space that fits around this object.
     * @memberof scene.Container#
     */
    getBounds(skipUpdate?: boolean, rect?: Rectangle): Rectangle
    {
        const bounds = getGlobalBounds(this, skipUpdate, tempBounds);

        return rect ? rect.copyFromBounds(bounds) : bounds.rectangle.clone();
    }

} as Container;
