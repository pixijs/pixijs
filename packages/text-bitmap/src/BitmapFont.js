import { settings } from '@pixi/settings';
import { getResolutionOfUrl } from '@pixi/utils';
import { Rectangle } from '@pixi/math';
import { Texture } from '@pixi/core';

// Internal map of available fonts, by name
const available = {};

/**
 * BitmapFont represents a typeface available for use
 * with the BitmapText class.
 *
 * @class
 * @memberof PIXI
 */
export class BitmapFont
{
    /**
     * @param {PIXI.BitmapFontData} data
     * @param {Object.<string, PIXI.Texture>|PIXI.Texture[]} textures
     */
    constructor(data, textures)
    {
        const [info] = data.info;
        const [common] = data.common;
        const [page] = data.page;
        const res = getResolutionOfUrl(page.file, settings.RESOLUTION);
        const pagesTextures = {};

        /**
         * The name of the font face.
         *
         * @member {string}
         * @readOnly
         */
        this.font = info.face;

        /**
         * The size of the font face in pixels.
         *
         * @member {number}
         * @readOnly
         */
        this.size = info.size;

        /**
         * The line-height of the font face in pixels.
         *
         * @member {number}
         * @readOnly
         */
        this.lineHeight = common.lineHeight / res;

        /**
         * The map of characters by character code.
         *
         * @member {object}
         * @readOnly
         */
        this.chars = {};

        // Convert the input Texture, Textures or object
        // into a page Texture lookup by "id"
        for (const i in data.page)
        {
            const { id, file } = data.page[i];

            pagesTextures[id] = textures instanceof Array ? textures[i] : textures[file];
        }

        // parse letters
        for (const i in data.char)
        {
            const { id, page } = data.char[i];
            let { x, y, width, height, xoffset, yoffset, xadvance } = data.char[i];

            x /= res;
            y /= res;
            width /= res;
            height /= res;
            xoffset /= res;
            yoffset /= res;
            xadvance /= res;

            const rect = new Rectangle(
                x + (pagesTextures[page].frame.x / res),
                y + (pagesTextures[page].frame.y / res),
                width,
                height
            );

            this.chars[id] = {
                xOffset: xoffset,
                yOffset: yoffset,
                xAdvance: xadvance,
                kerning: {},
                texture: new Texture(
                    pagesTextures[page].baseTexture,
                    rect
                ),
                page,
            };
        }

        // parse kernings
        for (const i in data.kerning)
        {
            let { first, second, amount } = data.kerning[i];

            first /= res;
            second /= res;
            amount /= res;

            if (this.chars[second])
            {
                this.chars[second].kerning[first] = amount;
            }
        }
    }

    /**
     * Register a new bitmap font.
     *
     * @static
     * @param {PIXI.BitmapFontData} data
     * @param {Object.<string, PIXI.Texture>|PIXI.Texture[]} textures
     * @return {PIXI.BitmapFont} New font created
     */
    static register(data, textures)
    {
        const bitmapFont = new BitmapFont(data, textures);

        available[bitmapFont.font] = bitmapFont;

        return bitmapFont;
    }

    /**
     * Remove bitmap font by name.
     *
     * @static
     * @param {string} name
     */
    static unregister(name)
    {
        delete available[name];
    }

    /**
     * Collection of available fonts.
     * @readonly
     * @static
     * @member {Object<string, BitmapFont>} available
     */
    static get available()
    {
        return available;
    }
}

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

