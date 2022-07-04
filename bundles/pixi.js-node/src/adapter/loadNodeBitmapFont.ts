import type { LoadAsset, Loader, LoaderParser } from '@pixi/assets';
import { dirname, extname, join } from '@pixi/assets';
import type { Texture } from '@pixi/core';
import { ExtensionType } from '@pixi/core';
import type { IBitmapFontRawData } from '@pixi/text-bitmap';
import { BitmapFont, BitmapFontData, TextFormat, XMLStringFormat } from '@pixi/text-bitmap';
import fetch from 'cross-fetch';
import { parseStringPromise } from 'xml2js';

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

async function _loadBitmap(src: string, data: BitmapFontData, loader: Loader)
{
    const pages = data.page;

    const textureUrls = [];

    for (let i = 0; i < pages.length; ++i)
    {
        const pageFile = pages[i].file;
        const imagePath = join(dirname(src), pageFile);

        textureUrls.push(imagePath);
    }

    const textures: Texture[] = Object.values(await loader.load(textureUrls));

    return BitmapFont.install(data, textures, true);
}

async function xmlStringFormatTest(data: string): Promise<boolean>
{
    if (typeof data === 'string' && data.indexOf('<font>') > -1)
    {
        const xml = xmlJsonParser(await parseStringPromise(data));

        return xml.page.length > 0 && xml.info[0].face !== null;
    }

    return false;
}

const validExtensions = ['.xml', '.fnt'];

/** simple loader plugin for loading in bitmap fonts! */
export const loadNodeBitmapFont = {
    extension: ExtensionType.LoadParser,

    test(url: string): boolean
    {
        return validExtensions.includes(extname(url));
    },

    async testParse(data: string): Promise<boolean>
    {
        const isText = TextFormat.test(data);
        const isXMLText = await xmlStringFormatTest(data);

        return isText || isXMLText;
    },

    async parse(asset: string, data: LoadAsset, loader: Loader): Promise<BitmapFont>
    {
        const isText = TextFormat.test(asset);

        if (isText)
        {
            const parsed = TextFormat.parse(asset);

            return await _loadBitmap(data.src, parsed, loader);
        }

        return await _loadBitmap(data.src, XMLStringFormat.parse(asset), loader);
    },

    async load(url: string, _asset: LoadAsset, loader: Loader): Promise<BitmapFont>
    {
        const response = await fetch(url);

        const text = await response.text();

        const data = xmlJsonParser(await parseStringPromise(text));

        return await _loadBitmap(url, data, loader);
    },

    unload(bitmapFont: BitmapFont): void
    {
        bitmapFont.destroy();
    }
} as LoaderParser<BitmapFont | string>;
