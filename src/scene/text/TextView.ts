import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { emptyViewObserver } from '../../rendering/renderers/shared/view/View';
import { uid } from '../../utils/data/uid';
import { CanvasTextMetrics } from './canvas/CanvasTextMetrics';
import { TextStyle } from './TextStyle';

import type { PointData } from '../../maths/point/PointData';
import type { View, ViewObserver } from '../../rendering/renderers/shared/view/View';
import type { Bounds, BoundsData } from '../container/bounds/Bounds';
import type { TextureDestroyOptions, TypeOrBool } from '../container/destroyTypes';
import type { HTMLTextStyle, HTMLTextStyleOptions } from '../text-html/HtmlTextStyle';
import type { TextStyleOptions } from './TextStyle';

export type TextString = string | number | { toString: () => string };
export type AnyTextStyle = TextStyle | HTMLTextStyle;
export type AnyTextStyleOptions = TextStyleOptions | HTMLTextStyleOptions;

type Filter<T> = { [K in keyof T]: {
    text?: TextString;
    resolution?: number;
    style?: T[K]
} }[keyof T];

export type TextStyles = {
    canvas: TextStyleOptions | TextStyle;
    html: HTMLTextStyleOptions | HTMLTextStyle;
    bitmap: TextStyleOptions | TextStyle;
};

export type TextViewOptions = Filter<TextStyles>;

/**
 * A text view.
 * @memberof scene
 */
export class TextView implements View
{
    public readonly uid: number = uid('textView');
    public readonly owner: ViewObserver = emptyViewObserver;
    public batched = true;
    public anchor: ObservablePoint;
    public resolution: number = null;

    /** @internal */
    public _style: AnyTextStyle;
    /** @internal */
    public _didUpdate = true;
    public roundPixels?: 0 | 1 = 0;

    protected _bounds: BoundsData = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
    private _boundsDirty = true;
    private _text: string;

    constructor(options: TextViewOptions)
    {
        this.text = options.text ?? '';
        this.style = options.style;

        this.anchor = new ObservablePoint(this, 0, 0);

        this.resolution = options.resolution ?? null;
    }

    get renderPipeId(): string
    {
        return 'text';
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

        this._style = this.ensureTextStyle(style);

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

    protected ensureTextStyle(style: TextStyle | HTMLTextStyle | TextStyleOptions | HTMLTextStyleOptions): TextStyle
    {
        if (style instanceof TextStyle)
        {
            return style;
        }

        return new TextStyle(style);
    }

    public addBounds(bounds: Bounds)
    {
        const _bounds = this.bounds;

        bounds.addFrame(
            _bounds.minX,
            _bounds.minY,
            _bounds.maxX,
            _bounds.maxY,
        );
    }

    public containsPoint(point: PointData)
    {
        const width = this.bounds.maxX;
        const height = this.bounds.maxY;

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

    protected _updateBounds()
    {
        const bounds = this._bounds;
        const padding = this._style.padding;
        const anchor = this.anchor;
        const canvasMeasurement = CanvasTextMetrics.measureText(this.text, this._style);
        const { width, height } = canvasMeasurement;

        bounds.minX = (-anchor._x * width) - padding;
        bounds.maxX = bounds.minX + width;
        bounds.minY = (-anchor._y * height) - padding;
        bounds.maxY = bounds.minY + height;
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
