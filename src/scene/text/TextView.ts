import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { emptyViewObserver } from '../../rendering/renderers/shared/view/View';
import { uid } from '../../utils/data/uid';
import { BitmapFontManager } from './bitmap/BitmapFontManager';
import { CanvasTextMetrics } from './canvas/CanvasTextMetrics';
import { measureHtmlText } from './html/utils/measureHtmlText';
import { detectRenderType } from './utils/detectRenderType';
import { ensureTextStyle } from './utils/ensureTextStyle';

import type { PointData } from '../../maths/point/PointData';
import type { View, ViewObserver } from '../../rendering/renderers/shared/view/View';
import type { Bounds } from '../container/bounds/Bounds';
import type { TextureDestroyOptions, TypeOrBool } from '../container/destroyTypes';
import type { HTMLTextStyle, HTMLTextStyleOptions } from './html/HtmlTextStyle';
import type { TextStyle, TextStyleOptions } from './TextStyle';

export type TextString = string | number | { toString: () => string };
export type AnyTextStyle = TextStyle | HTMLTextStyle;
export type AnyTextStyleOptions = TextStyleOptions | HTMLTextStyleOptions;

type Filter<T> = { [K in keyof T]: {
    text?: TextString;
    renderMode?: K;
    resolution?: number;
    style?: T[K]
} }[keyof T];

export type TextStyles = {
    canvas: TextStyleOptions | TextStyle;
    html: HTMLTextStyleOptions | HTMLTextStyle;
    bitmap: TextStyleOptions | TextStyle;
};

export type TextViewOptions = Filter<TextStyles>;

const map = {
    canvas: 'text',
    html: 'htmlText',
    bitmap: 'bitmapText',
};

export class TextView implements View
{
    public readonly uid: number = uid('textView');
    public readonly renderPipeId: string = 'text';
    public readonly owner: ViewObserver = emptyViewObserver;
    public batched = true;
    public anchor: ObservablePoint;
    public resolution: number = null;

    /** @internal */
    public _style: AnyTextStyle;
    /** @internal */
    public _didUpdate = true;
    public roundPixels?: 0 | 1 = 0;

    private _bounds: [number, number, number, number] = [0, 1, 0, 0];
    private _boundsDirty = true;
    private _text: string;
    private readonly _renderMode: string;

    constructor(options: TextViewOptions)
    {
        this.text = options.text ?? '';

        const renderMode = options.renderMode ?? detectRenderType(options.style);

        this._renderMode = renderMode;

        this.style = ensureTextStyle(renderMode, options.style);

        this.renderPipeId = map[renderMode];

        this.anchor = new ObservablePoint(this, 0, 0);

        this.resolution = options.resolution ?? null;
    }

    set text(value: TextString)
    {
        // check its a string
        value = value.toString();

        if (this._text === value) return;

        this._text = value as string;
        this.onUpdate();
    }

    get text(): string
    {
        return this._text;
    }

    get style(): AnyTextStyle
    {
        return this._style;
    }

    set style(style: AnyTextStyle | Partial<AnyTextStyle> | AnyTextStyleOptions)
    {
        style = style || {};

        this._style?.off('update', this.onUpdate, this);

        this._style = ensureTextStyle(this._renderMode, style);

        this._style.on('update', this.onUpdate, this);
        this.onUpdate();
    }

    get bounds()
    {
        if (this._boundsDirty)
        {
            this._updateBounds();
            this._boundsDirty = false;
        }

        return this._bounds;
    }

    public addBounds(bounds: Bounds)
    {
        const _bounds = this.bounds;

        bounds.addFrame(
            _bounds[0],
            _bounds[2],
            _bounds[1],
            _bounds[3],
        );
    }

    public containsPoint(point: PointData)
    {
        const width = this.bounds[0];
        const height = this.bounds[2];
        const x1 = -width * this.anchor.x;
        let y1 = 0;

        if (point.x >= x1 && point.x <= x1 + width)
        {
            y1 = -height * this.anchor.y;

            if (point.y >= y1 && point.y <= y1 + height) return true;
        }

        return false;
    }

    /** @internal */
    public onUpdate()
    {
        this._didUpdate = true;
        this._boundsDirty = true;
        this.owner.onViewUpdate();
    }

    /** @internal */
    public _getKey(): string
    {
        // TODO add a dirty flag...
        return `${this.text}:${this._style.styleKey}`;
    }

    private _updateBounds()
    {
        const bounds = this._bounds;
        const padding = this._style.padding;
        const anchor = this.anchor;

        if (this.renderPipeId === 'bitmapText')
        {
            const bitmapMeasurement = BitmapFontManager.measureText(this.text, this._style);
            const scale = bitmapMeasurement.scale;
            const offset = bitmapMeasurement.offsetY * scale;

            const width = bitmapMeasurement.width * scale;
            const height = bitmapMeasurement.height * scale;

            bounds[0] = (-anchor._x * width) - padding;
            bounds[1] = bounds[0] + width;
            bounds[2] = (-anchor._y * (height + offset)) - padding;
            bounds[3] = bounds[2] + height;
        }
        else if (this.renderPipeId === 'htmlText')
        {
            const htmlMeasurement = measureHtmlText(this.text, this._style as HTMLTextStyle);

            const { width, height } = htmlMeasurement;

            bounds[0] = (-anchor._x * width) - padding;
            bounds[1] = bounds[0] + width;
            bounds[2] = (-anchor._y * height) - padding;
            bounds[3] = bounds[2] + height;
        }
        else
        {
            const canvasMeasurement = CanvasTextMetrics.measureText(this.text, this._style);

            const { width, height } = canvasMeasurement;

            bounds[0] = (-anchor._x * width) - padding;
            bounds[1] = bounds[0] + width;
            bounds[2] = (-anchor._y * height) - padding;
            bounds[3] = bounds[2] + height;
        }
    }

    /**
     * Destroys this text renderable and optionally its style texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the texture of the text style
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the text style
     */
    public destroy(options: TypeOrBool<TextureDestroyOptions> = false): void
    {
        (this as any).owner = null;
        this._bounds = null;
        this.anchor = null;

        this._style.destroy(options);
        this._style = null;
        this._text = null;
    }
}
