import EventEmitter from 'eventemitter3';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';

import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { FontMetrics } from '../text/canvas/CanvasTextMetrics';

export interface CharData
{
    id: number;
    xOffset: number;
    yOffset: number;
    xAdvance: number;
    kerning: Record<string, number>;
    texture?: Texture;
}

export interface RawCharData extends Omit<CharData, 'texture'>
{
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    letter: string;
}

export interface BitmapFontData
{
    baseLineOffset: number;
    chars: Record<string, RawCharData>;
    pages: { id: number; file: string }[];
    lineHeight: number;
    fontSize: number;
    fontFamily: string;
    distanceField?: {
        type: 'sdf' | 'msdf' | 'none';
        range: number;
    };
}

export interface BitmapFontInstallOptions
{
    /**
     * Characters included in the font set. You can also use ranges.
     * For example, `[['a', 'z'], ['A', 'Z'], "!@#$%^&*()~{}[] "]`.
     * Don't forget to include spaces ' ' in your character set!
     * @default BitmapFont.ALPHANUMERIC
     */
    chars?: string | (string | string[])[];
    /**
     * Render resolution for glyphs.
     * @default 1
     */
    resolution?: number;
    /**
     * Padding between glyphs on texture atlas. Lower values could mean more visual artifacts
     * and bleeding from other glyphs, larger values increase the space required on the texture.
     * @default 4
     */
    padding?: number;
    /**
     * Skip generation of kerning information for the BitmapFont.
     * If true, this could potentially increase the performance, but may impact the rendered text appearance.
     * @default false
     */
    skipKerning?: boolean;
}

interface BitmapFontEvents<Type>
{
    destroy: [Type];
}

export abstract class AbstractBitmapFont<FontType>
    extends EventEmitter<BitmapFontEvents<FontType>>
    implements Omit<BitmapFontData, 'chars' | 'pages' | 'fontSize'>
{
    /** The map of characters by character code. */
    public readonly chars: Record<string, CharData> = Object.create(null);

    /** The line-height of the font face in pixels. */
    public readonly lineHeight: BitmapFontData['lineHeight'] = 0;

    /** The name of the font face. */
    public readonly fontFamily: BitmapFontData['fontFamily'] = '';
    public readonly fontMetrics: FontMetrics = { fontSize: 0, ascent: 0, descent: 0 };
    public readonly baseLineOffset: BitmapFontData['baseLineOffset'] = 0;
    /** The range and type of the distance field for this font. */
    public readonly distanceField: BitmapFontData['distanceField'] = { type: 'none', range: 0 };
    /** The map of base page textures (i.e., sheets of glyphs). */
    public readonly pages: { texture: Texture }[] = [];

    public readonly baseMeasurementFontSize: number = 100;
    protected baseRenderedFontSize = 100;

    /**
     * @deprecated since 8.0.0
     * The name of the font face.
     */
    public get font(): BitmapFontData['fontFamily']
    {
        deprecation(v8_0_0, 'BitmapFont.font is deprecated, please use BitmapFont.fontFamily instead.');

        return this.fontFamily;
    }

    /** @deprecated since 8.0.0 */
    public get pageTextures(): AbstractBitmapFont<FontType>['pages']
    {
        deprecation(v8_0_0, 'BitmapFont.pageTextures is deprecated, please use BitmapFont.pages instead.');

        return this.pages;
    }

    /**
     * @deprecated since 8.0.0
     * The size of the font face in pixels.
     */
    public get size(): BitmapFontData['fontSize']
    {
        deprecation(v8_0_0, 'BitmapFont.size is deprecated, please use BitmapFont.fontMetrics.fontSize instead.');

        return this.fontMetrics.fontSize;
    }

    /**
     * @deprecated since 8.0.0
     * The kind of distance field for this font or "none".
     */
    public get distanceFieldRange(): BitmapFontData['distanceField']['range']
    {
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'BitmapFont.distanceFieldRange is deprecated, please use BitmapFont.distanceField.range instead.');

        return this.distanceField.range;
    }

    /**
     * @deprecated since 8.0.0
     * The range of the distance field in pixels.
     */
    public get distanceFieldType(): BitmapFontData['distanceField']['type']
    {
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'BitmapFont.distanceFieldType is deprecated, please use BitmapFont.distanceField.type instead.');

        return this.distanceField.type;
    }

    public destroy(): void
    {
        this.emit('destroy', this as unknown as FontType);

        this.removeAllListeners();

        for (const i in this.chars)
        {
            this.chars[i].texture.destroy();
        }

        (this.chars as null) = null;
    }
}
