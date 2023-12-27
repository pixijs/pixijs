import { TextView } from '../text/TextView';
import { BitmapFontManager } from './BitmapFontManager';

export class BitmapTextView extends TextView
{
    public readonly renderPipeId = 'bitmapText';

    protected _updateBounds()
    {
        const bounds = this._bounds;
        const padding = this._style.padding;
        const anchor = this.anchor;
        const bitmapMeasurement = BitmapFontManager.measureText(this.text, this._style);
        const scale = bitmapMeasurement.scale;
        const offset = bitmapMeasurement.offsetY * scale;
        const width = bitmapMeasurement.width * scale;
        const height = bitmapMeasurement.height * scale;

        bounds.minX = (-anchor._x * width) - padding;
        bounds.maxX = bounds.minX + width;
        bounds.minY = (-anchor._y * (height + offset)) - padding;
        bounds.maxY = bounds.minY + height;
    }
}
