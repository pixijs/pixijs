/**
 * Normalized parsed data from .fnt files.
 *
 * @class
 * @memberof PIXI
 */
export class BitmapFontData
{
    constructor()
    {
        /**
         * @member {Array.<{ face:string, size:number }>}
         * @readOnly
         */
        this.info = [];

        /**
         * @member {Array.<{ lineHeight:number }>}
         * @readOnly
         */
        this.common = [];

        /**
         * @member {Array.<{ id:number, file:string }>}
         * @readOnly
         */
        this.page = [];

        /**
         * @member {Array.<{
         *   id:string,
         *   page:number,
         *   x:number,
         *   y:number,
         *   width:number,
         *   height:number,
         *   xoffset:number,
         *   yoffset:number,
         *   xadvance:number
         * }>}
         * @readOnly
         */
        this.char = [];

        /**
         * @member {Array.<{first:number, second:number, amount:number}>}
         * @readOnly
         */
        this.kerning = [];
    }
}
