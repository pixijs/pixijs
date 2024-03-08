import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { Bounds } from '../container/bounds/Bounds';
import { Container } from '../container/Container';

import type { Size } from '../../maths/misc/Size';
import type { PointData } from '../../maths/point/PointData';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { ContainerOptions } from '../container/Container';
import type { Optional } from '../container/container-mixins/measureMixin';
import type { DestroyOptions } from '../container/destroyTypes';
import type { HTMLTextStyle, HTMLTextStyleOptions } from '../text-html/HtmlTextStyle';
import type { TextStyle, TextStyleOptions } from './TextStyle';

/**
 * A string or number that can be used as text.
 * @memberof text
 */
export type TextString = string | number | { toString: () => string };
/**
 * A union of all text styles, including HTML, Bitmap and Canvas text styles.
 * @memberof text
 * @see text.TextStyle
 * @see text.HTMLTextStyle
 */
export type AnyTextStyle = TextStyle | HTMLTextStyle;
/**
 * A union of all text style options, including HTML, Bitmap and Canvas text style options.
 * @memberof text
 * @see text.TextStyleOptions
 * @see text.HTMLTextStyleOptions
 */
export type AnyTextStyleOptions = TextStyleOptions | HTMLTextStyleOptions;

/**
 * Options for the {@link scene.Text} class.
 * @example
 * const text = new Text({
 *    text: 'Hello Pixi!',
 *    style: {
 *       fontFamily: 'Arial',
 *       fontSize: 24,
 *    fill: 0xff1010,
 *    align: 'center',
 *  }
 * });
 * @memberof text
 */
export interface TextOptions<
    TEXT_STYLE extends TextStyle = TextStyle,
    TEXT_STYLE_OPTIONS extends TextStyleOptions = TextStyleOptions,
> extends ContainerOptions
{
    /** The anchor point of the text. */
    anchor?: PointData | number;
    /** The copy for the text object. To split a line you can use '\n'. */
    text?: TextString;
    /** The resolution of the text. */
    resolution?: number;
    /**
     * The text style
     * @type {
     * text.TextStyle |
     * Partial<text.TextStyle> |
     * text.TextStyleOptions |
     * text.HTMLTextStyle |
     * Partial<text.HTMLTextStyle> |
     * text.HTMLTextStyleOptions
     * }
     */
    style?: TEXT_STYLE | TEXT_STYLE_OPTIONS;
    /** Whether or not to round the x/y position. */
    roundPixels?: boolean;
}

/**
 * An abstract Text class, used by all text type in Pixi. This includes Canvas, HTML, and Bitmap Text.
 * @see scene.Text
 * @see scene.BitmapText
 * @see scene.HTMLText
 * @memberof scene
 */
export abstract class AbstractText<
    TEXT_STYLE extends TextStyle = TextStyle,
    TEXT_STYLE_OPTIONS extends TextStyleOptions = TextStyleOptions,
> extends Container implements View
{
    public abstract readonly renderPipeId: string;
    public batched = true;
    public _anchor: ObservablePoint;
    /**
     * The resolution / device pixel ratio of the canvas.
     * @default 1
     */
    public resolution: number = null;

    public _style: TEXT_STYLE;
    public _didTextUpdate = true;
    public _roundPixels: 0 | 1 = 0;

    protected _bounds: Bounds = new Bounds();
    protected _boundsDirty = true;
    protected _text: string;
    private readonly _styleClass: new (options: TEXT_STYLE_OPTIONS) => TEXT_STYLE;

    constructor(
        options: TextOptions<TEXT_STYLE, TEXT_STYLE_OPTIONS>,
        styleClass: new (options: TEXT_STYLE_OPTIONS) => TEXT_STYLE
    )
    {
        const { text, resolution, style, anchor, width, height, roundPixels, ...rest } = options;

        super({
            ...rest
        });

        this._styleClass = styleClass;

        this.text = text ?? '';

        this.style = style;

        this.resolution = resolution ?? null;

        this.allowChildren = false;

        this._anchor = new ObservablePoint(
            {
                _onUpdate: () =>
                {
                    this.onViewUpdate();
                },
            },
        );

        if (anchor) this.anchor = anchor;
        this.roundPixels = roundPixels ?? false;

        // needs to be set after the container has initiated
        if (width) this.width = width;
        if (height) this.height = height;
    }

    /**
     * The anchor sets the origin point of the text.
     * The default is `(0,0)`, this means the text's origin is the top left.
     *
     * Setting the anchor to `(0.5,0.5)` means the text's origin is centered.
     *
     * Setting the anchor to `(1,1)` would mean the text's origin point will be the bottom right corner.
     *
     * If you pass only single parameter, it will set both x and y to the same value as shown in the example below.
     * @example
     * import { Text } from 'pixi.js';
     *
     * const text = new Text('hello world');
     * text.anchor.set(0.5); // This will set the origin to center. (0.5) is same as (0.5, 0.5).
     */
    get anchor(): ObservablePoint
    {
        return this._anchor;
    }

    set anchor(value: PointData | number)
    {
        typeof value === 'number' ? this._anchor.set(value) : this._anchor.copyFrom(value);
    }

    /**
     *  Whether or not to round the x/y position of the text.
     * @type {boolean}
     */
    get roundPixels()
    {
        return !!this._roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this._roundPixels = value ? 1 : 0;
    }

    /** Set the copy for the text object. To split a line you can use '\n'. */
    set text(value: TextString)
    {
        // check its a string
        value = value.toString();

        if (this._text === value) return;

        this._text = value as string;
        this.onViewUpdate();
    }

    get text(): string
    {
        return this._text;
    }

    get style(): TEXT_STYLE
    {
        return this._style;
    }

    /**
     * Set the style of the text.
     *
     * Set up an event listener to listen for changes on the style object and mark the text as dirty.
     *
     * If setting the `style` can also be partial {@link AnyTextStyleOptions}.
     * @type {
     * text.TextStyle |
     * Partial<text.TextStyle> |
     * text.TextStyleOptions |
     * text.HTMLTextStyle |
     * Partial<text.HTMLTextStyle> |
     * text.HTMLTextStyleOptions
     * }
     */
    set style(style: TEXT_STYLE | Partial<TEXT_STYLE> | TEXT_STYLE_OPTIONS)
    {
        style = style || {};

        this._style?.off('update', this.onViewUpdate, this);

        if (style instanceof this._styleClass)
        {
            this._style = style as TEXT_STYLE;
        }
        else
        {
            this._style = new this._styleClass(style as TEXT_STYLE_OPTIONS);
        }

        this._style.on('update', this.onViewUpdate, this);
        this.onViewUpdate();
    }

    /**
     * The local bounds of the Text.
     * @type {rendering.Bounds}
     */
    get bounds()
    {
        if (this._boundsDirty)
        {
            this._updateBounds();
            this._boundsDirty = false;
        }

        return this._bounds;
    }

    /** The width of the sprite, setting this will actually modify the scale to achieve the value set. */
    override get width(): number
    {
        return Math.abs(this.scale.x) * this.bounds.width;
    }

    override set width(value: number)
    {
        this._setWidth(value, this.bounds.width);
    }

    /** The height of the sprite, setting this will actually modify the scale to achieve the value set. */
    override get height(): number
    {
        return Math.abs(this.scale.y) * this.bounds.height;
    }

    override set height(value: number)
    {
        this._setHeight(value, this.bounds.height);
    }

    /**
     * Retrieves the size of the Text as a [Size]{@link Size} object.
     * This is faster than get the width and height separately.
     * @param out - Optional object to store the size in.
     * @returns - The size of the Text.
     */
    public override getSize(out?: Size): Size
    {
        if (!out)
        {
            out = {} as Size;
        }

        out.width = Math.abs(this.scale.x) * this.bounds.width;
        out.height = Math.abs(this.scale.y) * this.bounds.height;

        return out;
    }

    /**
     * Sets the size of the Text to the specified width and height.
     * This is faster than setting the width and height separately.
     * @param value - This can be either a number or a [Size]{@link Size} object.
     * @param height - The height to set. Defaults to the value of `width` if not provided.
     */
    public override setSize(value: number | Optional<Size, 'height'>, height?: number)
    {
        let convertedWidth: number;
        let convertedHeight: number;

        if (typeof value !== 'object')
        {
            convertedWidth = value;
            convertedHeight = height ?? value;
        }
        else
        {
            convertedWidth = value.width;
            convertedHeight = value.height ?? value.width;
        }

        if (convertedWidth !== undefined)
        {
            this._setWidth(convertedWidth, this.bounds.width);
        }

        if (convertedHeight !== undefined)
        {
            this._setHeight(convertedHeight, this.bounds.height);
        }
    }

    /**
     * Adds the bounds of this text to the bounds object.
     * @param bounds - The output bounds object.
     */
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

    /**
     * Checks if the text contains the given point.
     * @param point - The point to check
     */
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

    public onViewUpdate()
    {
        this._didChangeId += 1 << 12;
        this._boundsDirty = true;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        this._didTextUpdate = true;

        if (this.renderGroup)
        {
            this.renderGroup.onChildViewUpdate(this);
        }
    }

    public _getKey(): string
    {
        // TODO add a dirty flag...
        return `${this.text}:${this._style.styleKey}`;
    }

    protected abstract _updateBounds(): void;

    /**
     * Destroys this text renderable and optionally its style texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the texture of the text style
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the text style
     */
    public destroy(options: DestroyOptions = false): void
    {
        super.destroy(options);

        (this as any).owner = null;
        this._bounds = null;
        this._anchor = null;

        this._style.destroy(options);
        this._style = null;
        this._text = null;
    }
}

export function ensureOptions<
    TEXT_STYLE extends TextStyle,
    TEXT_STYLE_OPTIONS extends TextStyleOptions
>(
    args: any[],
    name: string
): TextOptions<TEXT_STYLE, TEXT_STYLE_OPTIONS>
{
    let options = (args[0] ?? {}) as TextOptions<TEXT_STYLE, TEXT_STYLE_OPTIONS>;

    // @deprecated
    if (typeof options === 'string' || args[1])
    {
        // #if _DEBUG
        deprecation(v8_0_0, `use new ${name}({ text: "hi!", style }) instead`);
        // #endif

        options = {
            text: options,
            style: args[1],
        } as TextOptions<TEXT_STYLE, TEXT_STYLE_OPTIONS>;
    }

    return options;
}
