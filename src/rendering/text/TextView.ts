import { Cache } from '../../assets/cache/Cache';
import { ObservablePoint } from '../../maths/ObservablePoint';
import { emptyViewObserver } from '../renderers/shared/View';
import { BitmapFontManager } from './bitmap/BitmapFontManager';
import { CanvasTextMetrics } from './canvas/CanvasTextMetrics';
import { TextStyle } from './TextStyle';

import type { PointData } from '../../maths/PointData';
import type { View } from '../renderers/shared/View';
import type { Bounds } from '../scene/bounds/Bounds';
import type { TextureDestroyOptions, TypeOrBool } from '../scene/destroyTypes';
import type { TextStyleOptions } from './TextStyle';

let uid = 0;

type Filter<T> = { [K in keyof T]: {
    text?: string;
    renderMode?: K;
    resolution?: number;
    style?: T[K]
} } [keyof T];

export type TextStyles = {
    canvas: TextStyleOptions | TextStyle;
    // html: HTMLTextStyle;
    bitmap: TextStyleOptions | TextStyle;
};

export type TextViewOptions = Filter<TextStyles>;

const map = {
    canvas: 'text',
    html: 'text',
    bitmap: 'bitmapText',
};

export class TextView implements View
{
    static defaultResolution = 1;
    static defaultAutoResolution = true;

    uid = uid++;

    batched = true;

    type = 'text';

    owner = emptyViewObserver;

    _bounds: [number, number, number, number] = [0, 1, 0, 0];

    boundsDirty = true;

    anchor: ObservablePoint;

    _autoResolution = TextView.defaultAutoResolution;
    _resolution = TextView.defaultResolution;

    readonly renderMode: 'canvas' | 'html' | 'bitmap';

    _style: TextStyle;
    private _text: string;
    didUpdate = true;

    constructor(options: TextViewOptions)
    {
        this._text = options.text;
        this._style = options.style instanceof TextStyle ? options.style : new TextStyle(options.style);

        const renderMode = options.renderMode ?? this.detectRenderType(this._style);

        this.type = map[renderMode];

        this.anchor = new ObservablePoint(this, 0, 0);

        this._resolution = options.resolution ?? TextView.defaultResolution;
    }

    set text(value: string)
    {
        // check its a string
        value = value.toString();

        if (this._text === value) return;

        this._text = value;
        this.onUpdate();
    }

    get text(): string
    {
        return this._text;
    }

    get style(): TextStyle
    {
        return this._style;
    }

    set style(style: TextStyle | Partial<TextStyle>)
    {
        style = style || {};

        this._style?.off('update', this.onUpdate, this);

        if (style instanceof TextStyle)
        {
            this._style = style;
        }
        else
        {
            this._style = new TextStyle(style);
        }

        this._style.on('update', this.onUpdate, this);

        this.onUpdate();
    }

    set resolution(value: number)
    {
        this._resolution = value;
    }

    get resolution(): number
    {
        return this._resolution;
    }

    get bounds()
    {
        if (this.boundsDirty)
        {
            this.updateBounds();
            this.boundsDirty = false;
        }

        return this._bounds;
    }

    updateBounds()
    {
        const bounds = this._bounds;

        if (this.type === 'bitmapText')
        {
            const bitmapMeasurement = BitmapFontManager.measureText(this.text, this._style);

            const scale = bitmapMeasurement.scale;

            const offset = bitmapMeasurement.offsetY * scale;

            bounds[0] = 0;
            bounds[1] = offset;
            bounds[2] = bitmapMeasurement.width * scale;
            bounds[3] = (bitmapMeasurement.height * scale) + offset;
        }
        else
        {
            const canvasMeasurement = CanvasTextMetrics.measureText(this.text, this._style);

            bounds[0] = 0;
            bounds[1] = 0;
            bounds[2] = canvasMeasurement.width;
            bounds[3] = canvasMeasurement.height;
        }
    }

    addBounds(bounds: Bounds)
    {
        const _bounds = this.bounds;

        bounds.addFrame(
            _bounds[0],
            _bounds[1],
            _bounds[2],
            _bounds[3],
        );
    }

    /**
     * @internal
     */
    onUpdate()
    {
        this.didUpdate = true;
        this.boundsDirty = true;
        this.owner.onViewUpdate();
    }

    _getKey(): string
    {
        // TODO add a dirty flag...
        return `${this.text}:${this._style.styleKey}`;
    }

    public containsPoint(point: PointData)
    {
        const width = this.bounds[2];
        const height = this.bounds[3];
        const x1 = -width * this.anchor.x;
        let y1 = 0;

        if (point.x >= x1 && point.x < x1 + width)
        {
            y1 = -height * this.anchor.y;

            if (point.y >= y1 && point.y < y1 + height) return true;
        }

        return false;
    }

    detectRenderType(style: TextStyle): 'canvas' | 'html' | 'bitmap'
    {
        return Cache.has(style.fontFamily as string) ? 'bitmap' : 'canvas';
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
        this.owner = null;
        this._bounds = null;
        this.anchor = null;

        this._style.destroy(options);
        this._style = null;
        this._text = null;
    }
}
