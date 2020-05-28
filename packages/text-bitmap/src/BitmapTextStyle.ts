import type { TextStyleAlign } from '@pixi/text';
import type { Point } from '@pixi/math';

export interface IBitmapTextStyle {
    font: string | IBitmapTextFontDescriptor;
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
