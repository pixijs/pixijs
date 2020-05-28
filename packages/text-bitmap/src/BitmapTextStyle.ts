import type { TextStyleAlign } from '@pixi/text';
import type { Point } from '@pixi/math';

export interface IBitmapTextStyle {
    font: string | IBitmapTextFontDescriptor;// @deprecated
    fontName: string;
    fontSize: number;
    tint: number;
    align: TextStyleAlign;
    letterSpacing: number;
    maxWidth: number;
    anchor: Point;
    roundPixels: boolean;
}

export interface IBitmapTextFontDescriptor {
    name: string;
    size: number;
}
