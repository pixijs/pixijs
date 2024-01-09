import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { Container } from '../container/Container';
import { BitmapFontManager } from '../text-bitmap/BitmapFontManager';
import { measureHtmlText } from '../text-html/utils/measureHtmlText';
import { CanvasTextMetrics } from './canvas/CanvasTextMetrics';
import { detectRenderType } from './utils/detectRenderType';
import { ensureTextStyle } from './utils/ensureTextStyle';

import type { PointData } from '../../maths/point/PointData';
import type { PointLike } from '../../maths/point/PointLike';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { Bounds, BoundsData } from '../container/bounds/Bounds';
import type { ContainerOptions } from '../container/Container';
import type { DestroyOptions } from '../container/destroyTypes';
import type { HTMLTextStyle, HTMLTextStyleOptions } from '../text-html/HtmlTextStyle';
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
 * @memberof scene
 */
export interface TextOptions extends ContainerOptions
{
    /** The anchor point of the text. */
    anchor?: PointLike,
    /** The copy for the text object. To split a line you can use '\n'. */
    text?: TextString;
    /** the render mode - `canvas` renders to a single canvas, `html` renders using css, `bitmap` uses a bitmap font */
    renderMode?: 'canvas' | 'html' | 'bitmap';
    /** The resolution of the text. */
    resolution?: number;
    /** The text style */
    style?: TextStyle | HTMLTextStyleOptions | HTMLTextStyle;
    /** Whether or not to round the x/y position. */
    roundPixels?: boolean;
}

/**
 * A Text Object will create a line or multiple lines of text.
 *
 * To split a line you can use '\n' in your text string, or, on the `style` object,
 * change its `wordWrap` property to true and and give the `wordWrapWidth` property a value.
 *
 * ### Render Mode
 * Text objects also have a `renderMode` property, which can be set to `text`, `bitmap` or `html`:
 *
 * .1 `text`: The text is created using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).
 *
 * The primary advantage of this class over BitmapText is that you have great control over the style of the text,
 * which you can change at runtime.
 *
 *
 * The primary disadvantages is that each piece of text has it's own texture, which can use more memory.
 * When text changes, this texture has to be re-generated and re-uploaded to the GPU, taking up time.
 *
 * .2 `bitmap`: The text is created using a bitmap font.
 *
 * The primary advantage of this render mode over `text` is that all of your textures are pre-generated and loading,
 * meaning that rendering is fast, and changing text has no performance implications.
 *
 * The primary disadvantage is that supporting character sets other than latin, such as CJK languages,
 * may be impractical due to the number of characters.
 *
 * .3 `html` uses an svg foreignObject to render HTML text.
 *
 * The primary advantages of this render mode are:
 *
 *  -- Supports [HTML tags](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals)
 * for styling such as `<strong>`, or `<em>`, as well as `<span style="">`
 *
 *   -- Better support for emojis and other HTML layout features, better compatibility with CSS
 *     line-height and letter-spacing.
 *
 * The primary disadvantages are:
 *   -- Unlike `text`, `html` rendering will vary slightly between platforms and browsers.
 * `html` uses SVG/DOM to render text and not Context2D's fillText like `text`.
 *
 *   -- Performance and memory usage is on-par with `text` (that is to say, slow and heavy)
 *
 *   -- Only works with browsers that support <foreignObject>.
 * @example
 * import { Text } from 'pixi.js';
 *
 * const text = new Text({
 *     text: 'Hello Pixi!',
 *     renderMode: 'text',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 * @memberof scene
 */
export class Text extends Container implements View
{
    public readonly renderPipeId: string = 'text';
    public batched = true;
    public _anchor: ObservablePoint;
    public resolution: number = null;

    /** @internal */
    public _style: AnyTextStyle;
    /** @internal */
    public _didTextUpdate = true;
    public _roundPixels: 0 | 1 = 0;

    private _bounds: BoundsData = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
    private _boundsDirty = true;
    private _text: string;
    private readonly _renderMode: 'canvas' | 'html' | 'bitmap';

    constructor(options?: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text?: TextString, options?: Partial<AnyTextStyle>);
    constructor(...args: [TextOptions?] | [TextString, Partial<AnyTextStyle>])
    {
        let options = args[0] ?? {} as TextOptions;

        // @deprecated
        if (typeof options === 'string' || args[1])
        {
            deprecation(v8_0_0, 'use new Text({ text: "hi!", style }) instead');
            options = {
                text: options,
                style: args[1],
            } as TextOptions;
        }

        const { text, renderMode, resolution, style, anchor, roundPixels, ...rest } = options as TextOptions;

        super({
            //   view: new TextView(definedProps({ style, text, renderMode, resolution })),
            label: 'Text',
            ...rest
        });

        this.text = text ?? '';

        this._renderMode = renderMode ?? detectRenderType(style);

        this.style = style;

        if (this._renderMode === 'bitmap')
        {
            this.style.fill ??= 0xffffff;
        }

        this.renderPipeId = map[this._renderMode];

        this.resolution = resolution ?? null;

        this.allowChildren = false;

        this._anchor = new ObservablePoint(
            {
                _onUpdate: () =>
                {
                    this.onViewUpdate();
                },
            },
            anchor?.x ?? 0,
            anchor?.y ?? 0
        );

        this.roundPixels = roundPixels ?? false;
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
    get anchor(): PointLike
    {
        return this._anchor;
    }

    set anchor(value: PointData)
    {
        this._anchor.x = value.x;
        this._anchor.y = value.y;
    }

    /** Whether or not to round the x/y position of the sprite. */
    get roundPixels()
    {
        return !!this._roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this._roundPixels = value ? 1 : 0;
    }

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

    get style(): AnyTextStyle
    {
        return this._style;
    }

    set style(style: AnyTextStyle | Partial<AnyTextStyle> | AnyTextStyleOptions)
    {
        style = style || {};

        this._style?.off('update', this.onViewUpdate, this);

        this._style = ensureTextStyle(this._renderMode, style);

        this._style.on('update', this.onViewUpdate, this);
        this.onViewUpdate();
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
    public onViewUpdate()
    {
        this._didChangeId += 1 << 12;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        this._didTextUpdate = true;
        this._boundsDirty = true;

        if (this.renderGroup)
        {
            this.renderGroup.onChildViewUpdate(this);
        }
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
        const anchor = this._anchor;

        if (this.renderPipeId === 'bitmapText')
        {
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
        else if (this.renderPipeId === 'htmlText')
        {
            const htmlMeasurement = measureHtmlText(this.text, this._style as HTMLTextStyle);

            const { width, height } = htmlMeasurement;

            bounds.minX = (-anchor._x * width) - padding;
            bounds.maxX = bounds.minX + width;
            bounds.minY = (-anchor._y * height) - padding;
            bounds.maxY = bounds.minY + height;
        }
        else
        {
            const canvasMeasurement = CanvasTextMetrics.measureText(this.text, this._style);

            const { width, height } = canvasMeasurement;

            bounds.minX = (-anchor._x * width) - padding;
            bounds.maxX = bounds.minX + width;
            bounds.minY = (-anchor._y * height) - padding;
            bounds.maxY = bounds.minY + height;
        }
    }

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

/**
 * This is a convenience class for generating a Text object with bitmap font.
 * It is an alias for `new Text({ renderMode: 'bitmap' })`.
 * @memberof scene
 */
export class BitmapText extends Text
{
    constructor(options: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text: TextString, options?: Partial<TextStyle>);
    constructor(...args: [TextOptions] | [TextString, Partial<TextStyle>])
    {
        let options: TextOptions = args[0] as TextOptions;

        // @deprecated
        if (typeof options === 'string' || args[1])
        {
            deprecation(v8_0_0, 'use new BitmapText({ text: "hi!", style }) instead');
            options = {
                text: options,
                style: args[1],
            } as TextOptions;
        }

        options.renderMode = 'bitmap';

        super(options);
    }
}

/**
 * This is a convenience class for generating a Text object with HTML text.
 * It is an alias for `new Text({ renderMode: 'html' })`.
 * @memberof scene
 */
export class HTMLText extends Text
{
    constructor(options: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text: TextString, options?: Partial<HTMLTextStyle>);
    constructor(...args: [TextOptions] | [TextString, Partial<HTMLTextStyle>])
    {
        let options: TextOptions = args[0] as TextOptions;

        // @deprecated
        if (typeof options === 'string' || args[1])
        {
            deprecation(v8_0_0, 'use new HTMLText({ text: "hi!", style }) instead');
            options = {
                text: options,
                style: args[1],
            } as TextOptions;
        }

        options.renderMode = 'html';

        super(options);
    }
}
