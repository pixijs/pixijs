import { settings } from '@pixi/settings';
import { getResolutionOfUrl } from '@pixi/utils';
import { Rectangle } from '@pixi/math';
import { Texture } from '@pixi/core';
import { autoDetectFormat } from './formats';
import { BitmapFontData } from './BitmapFontData';

import type { Dict } from '@pixi/utils';

interface IBitmapFontCharacter {
    xOffset: number;
    yOffset: number;
    xAdvance: number;
    texture: Texture;
    page: number;
    kerning: Dict<number>;
}

// Internal map of available fonts, by name
const available: Dict<BitmapFont> = {};

/**
 * BitmapFont represents a typeface available for use
 * with the BitmapText class. Use the `install` method
 * for adding a font to be used.
 *
 * @class
 * @memberof PIXI
 * @param {PIXI.BitmapFontData} data
 * @param {PIXI.Texture[]|Object.<string, PIXI.Texture>} textures
 */
export class BitmapFont
{
    public readonly font: string;
    public readonly size: number;
    public readonly lineHeight: number;
    public readonly chars: Dict<IBitmapFontCharacter>;

    constructor(data: BitmapFontData, textures: Texture[]|Dict<Texture>)
    {
        const [info] = data.info;
        const [common] = data.common;
        const [page] = data.page;
        const res = getResolutionOfUrl(page.file, settings.RESOLUTION);
        const pagesTextures: Dict<Texture> = {};

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

            pagesTextures[id] = textures instanceof Array
                ? textures[i] : textures[file];
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
     * Remove references to created glyph textures.
     */
    public destroy(): void
    {
        for (const id in this.chars)
        {
            this.chars[id].texture.destroy();
        }

        // Set readonly null.
        (this as any).chars = null;
    }

    /**
     * Register a new bitmap font.
     *
     * @static
     * @param {XMLDocument|string|PIXI.BitmapFontData} data - The
     *        characters map that could be provided as xml or raw string.
     * @param {Object.<string, PIXI.Texture>|PIXI.Texture|PIXI.Texture[]}
     *        textures - List of textures for each page.
     * @return {PIXI.BitmapFont} Result font object with font, size, lineHeight
     *         and char fields.
     */
    public static install(
        data: string|XMLDocument|BitmapFontData,
        textures: Texture|Texture[]|Dict<Texture>
    ): BitmapFont
    {
        let fontData;

        if (data instanceof BitmapFontData)
        {
            fontData = data;
        }
        else
        {
            const format = autoDetectFormat(data);

            if (!format)
            {
                throw new Error('Unrecognized data format for font.');
            }

            fontData = format.parse(data as any);
        }

        // Single texture, convert to list
        if (textures instanceof Texture)
        {
            textures = [textures];
        }

        const font = new BitmapFont(fontData, textures);

        available[font.font] = font;

        return font;
    }

    /**
     * Remove bitmap font by name.
     *
     * @static
     * @param {string} name
     */
    public static uninstall(name: string): void
    {
        const font = available[name];

        if (!font)
        {
            throw new Error(`No font found named '${name}'`);
        }

        font.destroy();
        delete available[name];
    }

    /**
     * Collection of available fonts.
     *
     * @readOnly
     * @static
     * @member {Object.<string, PIXI.BitmapFont>}
     */
    public static get available(): Dict<BitmapFont>
    {
        return available;
    }
}
