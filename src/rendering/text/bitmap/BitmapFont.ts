import { Rectangle } from '../../../maths/shapes/Rectangle';
import { Runner } from '../../renderers/shared/runner/Runner';
import { Texture } from '../../renderers/shared/texture/Texture';

import type { FontMetrics } from '../canvas/CanvasTextMetrics';
import type { TextStyle } from '../TextStyle';
import type { IBitmapFont } from './DynamicBitmapFont';

export interface CharData
{
    id: number
    xOffset: number
    yOffset: number
    xAdvance: number,
    kerning: Record<string, number>,
    texture?: Texture
}

export interface RawCharData
{
    id: number
    page: number
    xOffset: number
    yOffset: number
    xAdvance: number,
    x: number
    y: number
    width: number
    height: number
    letter: string
    kerning: Record<string, number>,
}

export interface BitmapFontData
{
    baseLineOffset: number;
    chars: Record<string, RawCharData>
    pages: {id: number, file: string}[]
    lineHeight: number
    fontSize: number
    fontName: string

    distanceField?: {
        fieldType: 'sdf' | 'msdf' | 'none'
        distanceRange: number
    }
}

export interface BitmapFontOptions
{
    data: BitmapFontData
    textures: Texture[]
}

export interface DynamicBitmapFontData
{
    style: TextStyle
}

export class BitmapFont implements IBitmapFont
{
    onFontDestroy = new Runner('onSourceDestroy');

    baseRenderedFontSize = 100;
    baseMeasurementFontSize = 100;

    pages: {texture: Texture}[] = [];

    chars: Record<string, CharData> = {};

    lineHeight = 0;

    fontMetrics: FontMetrics;
    fontName: string;

    baseLineOffset = 0;

    distanceField: {
        fieldType: string;
        distanceRange: number;
    };

    constructor(options: BitmapFontOptions)
    {
        this.pages = [];

        const { textures, data } = options;

        Object.keys(data.pages).forEach((key: string) =>
        {
            const pageData = data.pages[parseInt(key, 10)];

            const texture = textures[pageData.id];

            this.pages.push({ texture });
        });

        Object.keys(data.chars).forEach((key: string) =>
        {
            const charData = data.chars[key];
            const textureSource = textures[charData.page].source;

            const frame = new Rectangle(
                (charData.x) / textureSource.width,
                (charData.y) / textureSource.height,
                (charData.width) / textureSource.width,
                (charData.height) / textureSource.height,
            );

            const texture = new Texture({
                source: textureSource,
                layout: {
                    frame
                }
            });

            this.chars[key] = {
                id: key.codePointAt(0),
                xOffset: charData.xOffset,
                yOffset: charData.yOffset, // - 31, // + 61 - 87,
                xAdvance: charData.xAdvance,
                kerning: charData.kerning ?? {},
                texture,
            };
        });

        this.fontMetrics = {
            ascent: 0,
            descent: 0,
            fontSize: data.fontSize,
        };

        this.baseLineOffset = data.baseLineOffset;
        this.lineHeight = data.lineHeight; //* (100 / 35);// 1.3);
        this.fontName = data.fontName;

        this.baseMeasurementFontSize = data.fontSize;
        this.baseRenderedFontSize = data.fontSize;

        this.distanceField = data.distanceField ?? {
            fieldType: 'none',
            distanceRange: 0,
        };
    }

    destroy(): void
    {
        this.onFontDestroy.emit(this);

        for (const i in this.chars)
        {
            this.chars[i].texture.destroy();
        }

        this.chars = null;

        for (let i = 0; i < this.pages.length; i++)
        {
            const { texture } = this.pages[i];

            texture.destroy(true);
        }

        this.pages = null;
    }
}
