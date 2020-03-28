export type BitmapTextAlign = 'left' | 'center' | 'right';

export interface IBitmapTextStyle {
    font: string | IBitmapTextFontDescriptor;
    tint: number;
    align: BitmapTextAlign;
}

export interface IBitmapTextFontDescriptor {
    name: string;
    size: number;
}
