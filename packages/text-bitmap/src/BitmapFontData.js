/* eslint-disable max-len */

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
         * @member {PIXI.BitmapFontData~Info[]}
         * @readOnly
         */
        this.info = [];

        /**
         * @member {PIXI.BitmapFontData~Common[]}
         * @readOnly
         */
        this.common = [];

        /**
         * @member {PIXI.BitmapFontData~Page[]}
         * @readOnly
         */
        this.page = [];

        /**
         * @member {PIXI.BitmapFontData~Char[]}
         * @readOnly
         */
        this.char = [];

        /**
         * @member {PIXI.BitmapFontData~Kerning[]}
         * @readOnly
         */
        this.kerning = [];
    }
}

/**
 * @interface PIXI.IBitmapFontDataInfo
 * @property {string} face
 * @property {number} size
 */

/**
 * @interface PIXI.IBitmapFontDataCommon
 * @property {number} lineHeight
 */

/**
 * @interface PIXI.IBitmapFontDataPage
 * @property {number} id
 * @property {string} file
 */

/**
 * @interface PIXI.IBitmapFontDataChar
 * @property {string} id
 * @property {number} page
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} xoffset
 * @property {number} yoffset
 * @property {number} xadvance
 */

/**
 * @interface PIXI.IBitmapFontDataKerning
 * @property {number} first
 * @property {number} second
 * @property {number} amount
 */
