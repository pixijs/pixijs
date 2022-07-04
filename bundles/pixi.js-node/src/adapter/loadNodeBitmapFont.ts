import type { Texture } from '@pixi/core';
import { BitmapFont, BitmapFontData, TextFormat } from '@pixi/text-bitmap';
import path from 'path';
import { loadNodeTexture } from './loadNodeTexture';
import { parseStringPromise } from 'xml2js';
import fetch from 'cross-fetch';
import type { IBitmapFontRawData } from 'packages/text-bitmap/src/formats/TextFormat';

interface XMLRawJson
{
    font: {
        info: Array<{$: IBitmapFontRawData['info'][0]}>,
        common: Array<{$: IBitmapFontRawData['common'][0]}>,
        pages: Array<{page: [{ $: IBitmapFontRawData['page'][0]}]}>
        chars: Array<{$: {count: number}, char: [{ $: IBitmapFontRawData['char'][0]}]}>
        kernings?: Array<{$: {count: number}, kerning: [{ $: IBitmapFontRawData['kerning'][0]}]}>
        distanceField?: Array<{$: IBitmapFontRawData['distanceField'][0]}>,
    }
}

function xmlJsonParser(xml: XMLRawJson)
{
    const data = new BitmapFontData();
    const font = xml.font;
    const info = font.info;
    const common = font.common;
    const pages = font.pages;
    const chars = font.chars;
    const kernings = font.kernings;
    const distanceField = font.distanceField;

    info.forEach((element) =>
    {
        data.info.push({
            face: element.$.face,
            size: parseInt(element.$.size, 10),
        });
    });

    common.forEach((element) =>
    {
        data.common.push({
            lineHeight: parseInt(element.$.lineHeight, 10)
        });
    });

    pages.forEach((element) =>
    {
        element.page.forEach((page) =>
        {
            data.page.push({
                id: parseInt(page.$.id, 10),
                file: page.$.file,
            });
        });
    });

    chars.forEach((info) =>
    {
        const charArr = info.char;

        charArr.forEach((char) =>
        {
            data.char.push({
                id: parseInt(char.$.id, 10),
                page: parseInt(char.$.page, 10),
                x: parseInt(char.$.x, 10),
                y: parseInt(char.$.y, 10),
                width: parseInt(char.$.width, 10),
                height: parseInt(char.$.height, 10),
                xoffset: parseInt(char.$.xoffset, 10),
                yoffset: parseInt(char.$.yoffset, 10),
                xadvance: parseInt(char.$.xadvance, 10),
            });
        });
    });

    kernings?.forEach((info) =>
    {
        info.kerning?.forEach((kerning) =>
            data.kerning.push({
                first: parseInt(kerning.$.first, 10),
                second: parseInt(kerning.$.second, 10),
                amount: parseInt(kerning.$.amount, 10),
            })
        );
    });

    distanceField?.forEach((df) =>
    {
        data.distanceField.push({
            distanceRange: parseInt(df.$.distanceRange, 10),
            fieldType: df.$.fieldType,
        });
    });

    return data;
}

const validExtensions = ['.xml', '.fnt'];

/** simple loader plugin for loading in bitmap fonts! */
export const loadNodeBitmapFont = {
    test(url: string): boolean
    {
        const tempUrl = new URL(url);
        const extension = path.extname(tempUrl.pathname);

        return validExtensions.includes(extension);
    },

    testParse(data: string): boolean
    {
        return typeof data === 'string' && data.indexOf('info face=') === 0;
    },

    async _load(url: string, data: BitmapFontData)
    {
        const pages = data.page;

        const textureUrls = [];

        for (let i = 0; i < pages.length; ++i)
        {
            const pageFile = pages[i].file;
            const pageUrl = new URL(pageFile, url);

            const imagePath = pageUrl;

            textureUrls.push(imagePath.href);
        }

        const textures: Texture[] = [];

        for (let i = 0; i < textureUrls.length; i++)
        {
            const url = textureUrls[i];

            textures.push(await loadNodeTexture.load(url, { data: {} }));
        }

        return BitmapFont.install(data, textures, true);
    },

    async parse(url: string, asset: string): Promise<BitmapFont>
    {
        return await this._load(url, TextFormat.parse(asset));
    },

    async load(url: string): Promise<BitmapFont>
    {
        const response = await fetch(url);

        const text = await response.text();

        const data = xmlJsonParser(await parseStringPromise(text));

        return await this._load(url, data);
    },
};
