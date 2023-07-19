import { Matrix } from '../../../maths/Matrix';
import { Bounds } from '../bounds/Bounds';
import { getGlobalBounds } from '../bounds/getGlobalBounds';
import { getLocalBounds } from '../bounds/getLocalBounds';

import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { Container } from '../Container';

export interface MeasureMixin
{
    width: number;
    height: number;

    getLocalBounds(): Rectangle;
    getBounds(skipUpdate?: boolean): Rectangle;
}

const tempBounds = new Bounds();
const tempMatrix = new Matrix();

export const measureMixin: Partial<Container> = {

    get width(): number
    {
        return this.scale.x * getLocalBounds(this, tempBounds, tempMatrix).width;
    },

    set width(value: number)
    {
        const localWidth = getLocalBounds(this, tempBounds, tempMatrix).width;

        if (localWidth !== 0)
        {
            this.scale.x = value / localWidth;
        }
        else
        {
            this.scale.x = 1;
        }
    },

    get height(): number
    {
        return this.scale.y * getLocalBounds(this, tempBounds, tempMatrix).height;
    },

    set height(value: number)
    {
        const localHeight = getLocalBounds(this, tempBounds, tempMatrix).height;

        if (localHeight !== 0)
        {
            this.scale.y = value / localHeight;
        }
        else
        {
            this.scale.y = 1;
        }
    },

    /**
     * Retrieves the local bounds of the displayObject as a Bounds object.
     * @returns - The bounding area.
     */
    getLocalBounds(): Rectangle
    {
        return getLocalBounds(this, new Bounds(), tempMatrix).rectangle;
    },

    /**
     * Calculates and returns the (world) bounds of the display object as a [Rectangle]{@link PIXI.Rectangle}.
     * @param skipUpdate - Setting to `true` will stop the transforms of the scene graph from
     *  being updated. This means the calculation returned MAY be out of date BUT will give you a
     *  nice performance boost.
     * @returns - The minimum axis-aligned rectangle in world space that fits around this object.
     */
    getBounds(skipUpdate?: boolean): Rectangle
    {
        return getGlobalBounds(this, skipUpdate, tempBounds).rectangle;
    }

} as Container;
