import { Rectangle } from '../../maths/shapes/Rectangle';
import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { AbstractBitmapFont } from './AbstractBitmapFont';

import type { FontMetrics } from '../text/canvas/CanvasTextMetrics';
import type { BitmapFontData } from './AbstractBitmapFont';

export interface BitmapFontOptions
{
    data: BitmapFontData
    textures: Texture[]
}

export class BitmapFont extends AbstractBitmapFont<BitmapFont>
{
    public url?: string;

    constructor(options: BitmapFontOptions, url?: string)
    {
        super();

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

            const frameReal = new Rectangle(
                charData.x,
                charData.y,
                charData.width,
                charData.height,
            );

            const texture = new Texture({
                source: textureSource,
                frame: frameReal
            });

            this.chars[key] = {
                id: key.codePointAt(0),
                xOffset: charData.xOffset,
                yOffset: charData.yOffset,
                xAdvance: charData.xAdvance,
                kerning: charData.kerning ?? {},
                texture,
            };
        });

        this.baseRenderedFontSize = data.fontSize;

        (this.baseMeasurementFontSize as number) = data.fontSize;
        (this.fontMetrics as FontMetrics) = {
            ascent: 0,
            descent: 0,
            fontSize: data.fontSize,
        };
        (this.baseLineOffset as number) = data.baseLineOffset;
        (this.lineHeight as number) = data.lineHeight;
        (this.fontFamily as string) = data.fontFamily;
        (this.distanceField as { type: string, range: number }) = data.distanceField ?? {
            type: 'none',
            range: 0,
        };

        this.url = url;
    }

    public override destroy(): void
    {
        super.destroy();

        for (let i = 0; i < this.pages.length; i++)
        {
            const { texture } = this.pages[i];

            texture.destroy(true);
        }

        (this.pages as null) = null;
    }
}
