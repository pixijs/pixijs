import { Texture } from '@pixi/core';

/**
 * Fill style object for Graphics.
 * @class
 * @memberof PIXI
 */
export default class FillStyle
{
    constructor()
    {
        this.reset();
    }

    /**
     * Convert the object to JSON
     *
     * @return {object}
     */
    toJSON()
    {
        return this.copy({});
    }

    /**
     * Clones the object
     *
     * @return {PIXI.FillStyle}
     */
    clone()
    {
        return this.copy(new FillStyle());
    }

    /**
     * Changes the values of the given fillStyle to be the same as the ones in this matrix
     *
     * @param {object} obj - The style to copy to.
     * @return {object} The style given in parameter with its values updated.
     */
    copy(obj)
    {
        obj.color = this.color;
        obj.alpha = this.alpha;
        obj.texture = this.texture;
        obj.matrix = this.matrix;
        obj.visible = this.visible;

        return obj;
    }

    /**
     * Reset
     */
    reset()
    {
        /**
         * The hex color value used when coloring the Graphics object.
         *
         * @member {number}
         * @default 1
         */
        this.color = 0xFFFFFF;

        /**
         * The alpha value used when filling the Graphics object.
         *
         * @member {number}
         * @default 1
         */
        this.alpha = 1;

        /**
         * The texture to be used for the fill.
         *
         * @member {string}
         * @default 0
         */
        this.texture = Texture.WHITE;

        /**
         * The transform aplpied to the texture.
         *
         * @member {string}
         * @default 0
         */
        this.matrix = null;

        /**
         * If the current fill is visible.
         *
         * @member {boolean}
         * @default false
         */
        this.visible = false;
    }

    /**
     * Destroy and don't use after this
     */
    destroy()
    {
        this.texture = null;
        this.matrix = null;
    }
}
