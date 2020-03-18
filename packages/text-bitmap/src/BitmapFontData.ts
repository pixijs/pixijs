/* eslint-disable max-len */

/**
 * Normalized parsed data from .fnt files.
 *
 * @class
 * @memberof PIXI
 */
export class BitmapFontData
{
    public info: IBitmapFontDataInfo[];
    public common: IBitmapFontDataCommon[];
    public page: IBitmapFontDataPage[];
    public char: IBitmapFontDataChar[];
    public kerning: IBitmapFontDataKerning[];

    constructor()
    {
        /**
         * @member {PIXI.IBitmapFontDataInfo[]}
         * @readOnly
         */
        this.info = [];

        /**
         * @member {PIXI.IBitmapFontDataCommon[]}
         * @readOnly
         */
        this.common = [];

        /**
         * @member {PIXI.IBitmapFontDataPage[]}
         * @readOnly
         */
        this.page = [];

        /**
         * @member {PIXI.IBitmapFontDataChar[]}
         * @readOnly
         */
        this.char = [];

        /**
         * @member {PIXI.IBitmapFontDataKerning[]}
         * @readOnly
         */
        this.kerning = [];
    }
}

export interface IBitmapFontDataInfo {
    face: string;
    size: number;
}

export interface IBitmapFontDataCommon {
    lineHeight: number;
}

export interface IBitmapFontDataPage {
    id: number;
    file: string;
}

export interface IBitmapFontDataChar {
    id: number;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
}

export interface IBitmapFontDataKerning {
    first: number;
    second: number;
    amount: number;
}

/**
 * @memberof PIXI
 * @typedef {object} IBitmapFontDataInfo
 * @property {string} face
 * @property {number} size
 */

/**
 * @memberof PIXI
 * @typedef {object} IBitmapFontDataCommon
 * @property {number} lineHeight
 */

/**
 * @memberof PIXI
 * @typedef {object} IBitmapFontDataPage
 * @property {number} id
 * @property {string} file
 */

/**
 * @memberof PIXI
 * @typedef {object} IBitmapFontDataChar
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
 * @memberof PIXI
 * @typedef {object} IBitmapFontDataKerning
 * @property {number} first
 * @property {number} second
 * @property {number} amount
 */
