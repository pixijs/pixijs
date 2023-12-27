import { TextView } from '../text/TextView';
import { HTMLTextStyle } from './HtmlTextStyle';
import { measureHtmlText } from './utils/measureHtmlText';

import type { TextStyle, TextStyleOptions } from '../text/TextStyle';
import type { HTMLTextStyleOptions } from './HtmlTextStyle';

export class HTMLTextView extends TextView
{
    public readonly renderPipeId = 'htmlText';

    protected _updateBounds()
    {
        const bounds = this._bounds;
        const padding = this._style.padding;
        const anchor = this.anchor;
        const htmlMeasurement = measureHtmlText(this.text, this._style as HTMLTextStyle);
        const { width, height } = htmlMeasurement;

        bounds.minX = (-anchor._x * width) - padding;
        bounds.maxX = bounds.minX + width;
        bounds.minY = (-anchor._y * height) - padding;
        bounds.maxY = bounds.minY + height;
    }

    protected ensureTextStyle(style: TextStyle | HTMLTextStyle | TextStyleOptions | HTMLTextStyleOptions): TextStyle
    {
        if (style instanceof HTMLTextStyle)
        {
            return style;
        }

        return new HTMLTextStyle(style);
    }
}
