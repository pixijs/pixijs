import { Rectangle } from '../../../maths/shapes/Rectangle';
import { Texture } from '../../renderers/shared/texture/Texture';
import { AbstractBitmapFont } from './AbstractBitmapFont';

import type { Writeable } from '../../../utils/types';
import type { BitmapFontData } from './AbstractBitmapFont';

export interface BitmapFontOptions
{
    data: BitmapFontData
    textures: Texture[]
}

type WriteableBitmapFont = Writeable<BitmapFont, keyof BitmapFont>;

export class BitmapFont extends AbstractBitmapFont<BitmapFont>
{
    constructor(options: BitmapFontOptions)
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
                yOffset: charData.yOffset,
                xAdvance: charData.xAdvance,
                kerning: charData.kerning ?? {},
                texture,
            };
        });

        this.baseRenderedFontSize = data.fontSize;

        const writable = this as WriteableBitmapFont;

        writable.baseMeasurementFontSize = data.fontSize;
        writable.fontMetrics = {
            ascent: 0,
            descent: 0,
            fontSize: data.fontSize,
        };
        writable.baseLineOffset = data.baseLineOffset;
        writable.lineHeight = data.lineHeight;
        writable.fontName = data.fontName;
        writable.distanceField = data.distanceField ?? {
            type: 'none',
            range: 0,
        };
    }

    public override destroy(): void
    {
        super.destroy();

        for (let i = 0; i < this.pages.length; i++)
        {
            const { texture } = this.pages[i];

            texture.destroy(true);
        }

        (this as WriteableBitmapFont).pages = null;
    }
}
