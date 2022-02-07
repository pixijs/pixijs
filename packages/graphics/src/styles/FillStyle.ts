import { Texture } from '@pixi/core';
import type { Matrix } from '@pixi/math';

/**
 * Fill style object for Graphics.
 *
 * @memberof PIXI
 */
export class FillStyle
{
    /**
     * The hex color value used when coloring the Graphics object.
     *
     * @default 0xFFFFFF
     */
    public color = 0xFFFFFF;

    /** The alpha value used when filling the Graphics object. */
    public alpha = 1.0;

    /**
     * The texture to be used for the fill.
     *
     * @default 0
     */
    public texture: Texture = Texture.WHITE;

    /**
     * The transform applied to the texture.
     *
     * @default null
     */
    public matrix: Matrix = null;

    /** If the current fill is visible. */
    public visible = false;

    constructor()
    {
        this.reset();
    }

    /** Clones the object */
    public clone(): FillStyle
    {
        const obj = new FillStyle();

        obj.color = this.color;
        obj.alpha = this.alpha;
        obj.texture = this.texture;
        obj.matrix = this.matrix;
        obj.visible = this.visible;

        return obj;
    }

    /** Reset */
    public reset(): void
    {
        this.color = 0xFFFFFF;
        this.alpha = 1;
        this.texture = Texture.WHITE;
        this.matrix = null;
        this.visible = false;
    }

    /** Destroy and don't use after this. */
    public destroy(): void
    {
        this.texture = null;
        this.matrix = null;
    }
}
