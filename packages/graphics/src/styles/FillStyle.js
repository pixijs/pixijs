import { Texture } from '@pixi/core';

/**
 * Fill style object for Graphics.
 *
 * @class
 * @memberof PIXI
 */
export class FillStyle
{
    constructor()
    {
        this.reset();
    }

    /**
     * Clones the object
     *
     * @return {PIXI.FillStyle}
     */
    clone()
    {
        const obj = new FillStyle();

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
