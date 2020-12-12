import type { TextStyleAlign } from '@pixi/text';

export interface IBitmapTextStyle {
    fontName: string;
    fontSize: number;
    tint: number;
    align: TextStyleAlign;
    letterSpacing: number;
    maxWidth: number;
}

export interface IBitmapTextFontDescriptor {
    name: string;
    size: number;
}
