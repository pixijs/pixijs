import type { TextStyleAlign } from '@pixi/text';

export interface IBitmapTextStyle {
    font: string | IBitmapTextFontDescriptor;
    tint: number;
    align: TextStyleAlign;
}

export interface IBitmapTextFontDescriptor {
    name: string;
    size: number;
}
