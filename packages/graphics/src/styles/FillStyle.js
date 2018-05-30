export default class FillStyle
{
    constructor()
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
        this.texture = null;

        /**
         * The transform aplpied to the texture.
         *
         * @member {string}
         * @default 0
         */
        this.matrix = null;
    }
}
