import type { ColorSource } from '@pixi/core';
import type { TextStyleAlign } from '@pixi/text';

export interface IBitmapTextStyle
{
    fontName: string;
    fontSize: number;
    tint: ColorSource;
    align: TextStyleAlign;
    letterSpacing: number;
    maxWidth: number;
}

export interface IBitmapTextFontDescriptor
{
    name: string;
    size: number;
}
