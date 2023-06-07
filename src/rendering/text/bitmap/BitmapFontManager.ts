import { Cache } from '../../../assets/cache/Cache';
import { DynamicBitmapFont } from './DynamicBitmapFont';
import { getBitmapTextLayout } from './utils/getBitmapTextLayout';

import type { TextStyle } from '../TextStyle';
import type { BitmapFont } from './BitmapFont';
import type { BitmapTextLayoutData } from './utils/getBitmapTextLayout';

class BitmapFontManagerClass
{
    getFont(text: string, style: TextStyle): BitmapFont
    {
        let fontFamilyKey = style.fontFamily as string;
        let overrideFill = true;

        // assuming there is no texture we can use a tint!
        if (style._fill.fill)
        {
            fontFamilyKey += style._fill.fill.uid;
            overrideFill = false;
        }

        // first get us the the right font...
        if (!Cache.has(fontFamilyKey))
        {
            Cache.set(fontFamilyKey as string, new DynamicBitmapFont({
                style,
                overrideFill,
            }));
        }

        const dynamicFont = Cache.get(fontFamilyKey);

        (dynamicFont as DynamicBitmapFont).ensureCharacters?.(text);

        return dynamicFont;
    }

    getLayout(text: string, style: TextStyle): BitmapTextLayoutData
    {
        const bitmapFont = this.getFont(text, style);

        return getBitmapTextLayout(text.split(''), style, bitmapFont);
    }

    measureText(text: string, style: TextStyle): { width: number, height: number, scale: number, offsetY: number }
    {
        return this.getLayout(text, style);
    }
}

export const BitmapFontManager = new BitmapFontManagerClass();
