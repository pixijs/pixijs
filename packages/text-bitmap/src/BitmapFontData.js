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
 * @interface Info
 * @memberof PIXI.BitmapFontData~
 * @property {string} face
 * @property {number} size
 */

/**
 * @interface Common
 * @memberof PIXI.BitmapFontData~
 * @property {number} lineHeight
 */

/**
 * @interface Page
 * @memberof PIXI.BitmapFontData~
 * @property {number} id
 * @property {string} file
 */

/**
 * @interface Char
 * @memberof PIXI.BitmapFontData~
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
 * @interface Kerning
 * @memberof PIXI.BitmapFontData~
 * @property {number} first
 * @property {number} second
 * @property {number} amount
 */
