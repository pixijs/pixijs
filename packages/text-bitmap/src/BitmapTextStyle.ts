import type { TextStyleWhiteSpace, TextStyleAlign } from '@pixi/text';

export interface IBitmapTextStyle {
    font: string | IBitmapTextFontDescriptor;
    tint: number;

    align: TextStyleAlign;
    breakWords: boolean;
    letterSpacing: number;
    lineHeight: number;
    whiteSpace: TextStyleWhiteSpace;
    wordWrap: boolean;
    wordWrapWidth: number;
}

export interface IBitmapTextFontDescriptor {
    name: string;
    size: number;
}
