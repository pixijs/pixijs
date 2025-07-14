import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { ViewContainer, type ViewContainerOptions } from '../view/ViewContainer';

import type { Size } from '../../maths/misc/Size';
import type { PointData } from '../../maths/point/PointData';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { Optional } from '../container/container-mixins/measureMixin';
import type { DestroyOptions } from '../container/destroyTypes';
import type { HTMLTextStyle, HTMLTextStyleOptions } from '../text-html/HTMLTextStyle';
import type { TextStyle, TextStyleOptions } from './TextStyle';

/**
 * A string or number that can be used as text.
 * @example
 * ```ts
 * const text: TextString = 'Hello Pixi!';
 * const text2: TextString = 12345;
 * const text3: TextString = { toString: () => 'Hello Pixi!' };
 * ```
 * @category text
 * @standard
 */
export type TextString = string | number | { toString: () => string };
/**
 * A union of all text styles, including HTML, Bitmap and Canvas text styles.
 * This is used to allow for any text style to be passed to a text object.
 * @example
 * ```ts
 * import { TextStyle, HTMLTextStyle } from 'pixi.js';
 * const style: AnyTextStyle = new TextStyle({ fontSize: 24 });
 * const htmlStyle: AnyTextStyle = new HTMLTextStyle({ fontSize: '24px' });
 * ```
 * @category text
 * @standard
 * @see TextStyle
 * @see HTMLTextStyle
 */
export type AnyTextStyle = TextStyle | HTMLTextStyle;
/**
 * A union of all text style options, including HTML, Bitmap and Canvas text style options.
 * This is used to allow for any text style options to be passed to a text object.
 * @example
 * ```ts
 * import { TextStyleOptions, HTMLTextStyleOptions } from 'pixi.js';
 * const styleOptions: AnyTextStyleOptions = { fontSize: 24 } as TextStyleOptions;
 * const htmlStyleOptions: AnyTextStyleOptions = { fontSize: '24px' } as HTMLTextStyleOptions;
 * ```
 * @category text
 * @standard
 * @see TextStyleOptions
 * @see HTMLTextStyleOptions
 */
export type AnyTextStyleOptions = TextStyleOptions | HTMLTextStyleOptions;

/**
 * Options for creating text objects in PixiJS. This interface defines the common properties
 * used across different text rendering implementations (Canvas, HTML, and Bitmap).
 * @example
 * ```ts
 * // Create basic text with minimal options
 * const basicText = new Text({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontSize: 24,
 *         fill: 0xff1010
 *     }
 * });
 *
 * // Create text with advanced styling
 * const styledText = new Text({
 *     text: 'Styled Text',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 32,
 *         fill: new FillGradient({
 *             end: { x: 1, y: 1 },
 *             stops: [
 *                 { color: 0xff0000, offset: 0 }, // Red at start
 *                 { color: 0x0000ff, offset: 1 }, // Blue at end
 *             ]
 *         }),
 *         stroke: { color: '#4a1850', width: 5 },
 *         dropShadow: {
 *             color: '#000000',
 *             blur: 4,
 *             distance: 6
 *         },
 *         align: 'center'
 *     },
 *     anchor: 0.5,
 *     resolution: window.devicePixelRatio
 * });
 *
 * // Create multiline text with word wrap
 * const wrappedText = new Text({
 *     text: 'This is a long piece of text that will wrap onto multiple lines',
 *     style: {
 *         fontSize: 20,
 *         wordWrap: true,
 *         wordWrapWidth: 200,
 *         lineHeight: 30
 *     },
 *     resolution: 2,
 *     roundPixels: true
 * });
 * ```
 * @category text
 * @standard
 * @noInheritDoc
 */
export interface TextOptions<
    TEXT_STYLE extends TextStyle = TextStyle,
    TEXT_STYLE_OPTIONS extends TextStyleOptions = TextStyleOptions,
> extends PixiMixins.TextOptions, ViewContainerOptions
{
    /**
     * The anchor point of the text that controls the origin point for positioning and rotation.
     * Can be a number (same value for x/y) or a PointData object.
     * - (0,0) is top-left
     * - (0.5,0.5) is center
     * - (1,1) is bottom-right
     * ```ts
     * // Set anchor to center
     * const text = new Text({
     *     text: 'Hello Pixi!',
     *     anchor: 0.5 // Same as { x: 0.5, y: 0.5 }
     * });
     * // Set anchor to top-left
     * const text2 = new Text({
     *     text: 'Hello Pixi!',
     *     anchor: { x: 0, y: 0 } // Top-left corner
     * });
     * // Set anchor to bottom-right
     * const text3 = new Text({
     *     text: 'Hello Pixi!',
     *     anchor: { x: 1, y: 1 } // Bottom-right corner
     * });
     * ```
     * @default { x: 0, y: 0 }
     */
    anchor?: PointData | number;
    /**
     * The text content to display. Use '\n' for line breaks.
     * Accepts strings, numbers, or objects with toString() method.
     * @example
     * ```ts
     * const text = new Text({
     *     text: 'Hello Pixi!',
     * });
     * const multilineText = new Text({
     *     text: 'Line 1\nLine 2\nLine 3',
     * });
     * const numberText = new Text({
     *     text: 12345, // Will be converted to '12345'
     * });
     * const objectText = new Text({
     *     text: { toString: () => 'Object Text' }, // Custom toString
     * });
     * ```
     * @default ''
     */
    text?: TextString;
    /**
     * The resolution/device pixel ratio for rendering.
     * Higher values result in sharper text at the cost of performance.
     * Set to null for auto-resolution based on device.
     * @example
     * ```ts
     * const text = new Text({
     *     text: 'Hello Pixi!',
     *     resolution: 2 // High DPI for sharper text
     * });
     * const autoResText = new Text({
     *     text: 'Auto Resolution',
     *     resolution: null // Use device's pixel ratio
     * });
     * ```
     * @default null
     */
    resolution?: number;
    /**
     * The style configuration for the text.
     * Can be a TextStyle instance or a configuration object.
     * Supports canvas text styles, HTML text styles, and bitmap text styles.
     * @example
     * ```ts
     * const text = new Text({
     *     text: 'Styled Text',
     *     style: {
     *         fontSize: 24,
     *         fill: 0xff1010, // Red color
     *         fontFamily: 'Arial',
     *         align: 'center', // Center alignment
     *         stroke: { color: '#4a1850', width: 5 }, // Purple stroke
     *         dropShadow: {
     *             color: '#000000', // Black shadow
     *             blur: 4, // Shadow blur
     *             distance: 6 // Shadow distance
     *         }
     *     }
     * });
     * const htmlText = new HTMLText({
     *     text: 'HTML Styled Text',
     *     style: {
     *         fontSize: '20px',
     *         fill: 'blue',
     *         fontFamily: 'Verdana',
     *     }
     * });
     * const bitmapText = new BitmapText({
     *     text: 'Bitmap Styled Text',
     *     style: {
     *         fontName: 'Arial',
     *         fontSize: 32,
     *     }
     * })
     */
    style?: TEXT_STYLE | TEXT_STYLE_OPTIONS;
    /**
     * Whether to round the x/y position to whole pixels.
     * Enabling can prevent anti-aliasing of text edges but may cause slight position shifting.
     * @example
     * ```ts
     * const text = new Text({
     *     text: 'Rounded Text',
     *     roundPixels: true // Rounds position to whole pixels
     * });
     * @default false
     */
    roundPixels?: boolean;
}

/**
 * An abstract Text class, used by all text type in Pixi. This includes Canvas, HTML, and Bitmap Text.
 * @see Text
 * @see BitmapText
 * @see HTMLText
 * @category text
 * @advanced
 */
export abstract class AbstractText<
    TEXT_STYLE extends TextStyle = TextStyle,
    TEXT_STYLE_OPTIONS extends TextStyleOptions = TextStyleOptions,
    TEXT_OPTIONS extends TextOptions<TEXT_STYLE, TEXT_STYLE_OPTIONS> = TextOptions<TEXT_STYLE, TEXT_STYLE_OPTIONS>,
    GPU_DATA extends { destroy: () => void } = any
> extends ViewContainer<GPU_DATA> implements View
{
    /** @internal */
    public batched = true;
    /** @internal */
    public _anchor: ObservablePoint;

    /** @internal */
    public _resolution: number = null;
    /** @internal */
    public _autoResolution: boolean = true;

    /** @internal */
    public _style: TEXT_STYLE;
    /** @internal */
    public _didTextUpdate = true;

    protected _text: string;
    private readonly _styleClass: new (options: TEXT_STYLE_OPTIONS) => TEXT_STYLE;

    constructor(
        options: TEXT_OPTIONS,
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
        if (width !== undefined) this.width = width;
        if (height !== undefined) this.height = height;
    }

    /**
     * The anchor point of the text that controls the origin point for positioning and rotation.
     * Can be a number (same value for x/y) or a PointData object.
     * - (0,0) is top-left
     * - (0.5,0.5) is center
     * - (1,1) is bottom-right
     * ```ts
     * // Set anchor to center
     * const text = new Text({
     *     text: 'Hello Pixi!',
     *     anchor: 0.5 // Same as { x: 0.5, y: 0.5 }
     * });
     * // Set anchor to top-left
     * const text2 = new Text({
     *     text: 'Hello Pixi!',
     *     anchor: { x: 0, y: 0 } // Top-left corner
     * });
     * // Set anchor to bottom-right
     * const text3 = new Text({
     *     text: 'Hello Pixi!',
     *     anchor: { x: 1, y: 1 } // Bottom-right corner
     * });
     * ```
     * @default { x: 0, y: 0 }
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
     * The text content to display. Use '\n' for line breaks.
     * Accepts strings, numbers, or objects with toString() method.
     * @example
     * ```ts
     * const text = new Text({
     *     text: 'Hello Pixi!',
     * });
     * const multilineText = new Text({
     *     text: 'Line 1\nLine 2\nLine 3',
     * });
     * const numberText = new Text({
     *     text: 12345, // Will be converted to '12345'
     * });
     * const objectText = new Text({
     *     text: { toString: () => 'Object Text' }, // Custom toString
     * });
     *
     * // Update text dynamically
     * text.text = 'Updated Text'; // Re-renders with new text
     * text.text = 67890; // Updates to '67890'
     * text.text = { toString: () => 'Dynamic Text' }; // Uses custom toString method
     * // Clear text
     * text.text = ''; // Clears the text
     * ```
     * @default ''
     */
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

    /**
     * The resolution/device pixel ratio for rendering.
     * Higher values result in sharper text at the cost of performance.
     * Set to null for auto-resolution based on device.
     * @example
     * ```ts
     * const text = new Text({
     *     text: 'Hello Pixi!',
     *     resolution: 2 // High DPI for sharper text
     * });
     * const autoResText = new Text({
     *     text: 'Auto Resolution',
     *     resolution: null // Use device's pixel ratio
     * });
     * ```
     * @default null
     */
    set resolution(value: number)
    {
        this._autoResolution = value === null;
        this._resolution = value;
        this.onViewUpdate();
    }

    get resolution(): number
    {
        return this._resolution;
    }

    get style(): TEXT_STYLE
    {
        return this._style;
    }

    /**
     * The style configuration for the text.
     * Can be a TextStyle instance or a configuration object.
     * Supports canvas text styles, HTML text styles, and bitmap text styles.
     * @example
     * ```ts
     * const text = new Text({
     *     text: 'Styled Text',
     *     style: {
     *         fontSize: 24,
     *         fill: 0xff1010, // Red color
     *         fontFamily: 'Arial',
     *         align: 'center', // Center alignment
     *         stroke: { color: '#4a1850', width: 5 }, // Purple stroke
     *         dropShadow: {
     *             color: '#000000', // Black shadow
     *             blur: 4, // Shadow blur
     *             distance: 6 // Shadow distance
     *         }
     *     }
     * });
     * const htmlText = new HTMLText({
     *     text: 'HTML Styled Text',
     *     style: {
     *         fontSize: '20px',
     *         fill: 'blue',
     *         fontFamily: 'Verdana',
     *     }
     * });
     * const bitmapText = new BitmapText({
     *     text: 'Bitmap Styled Text',
     *     style: {
     *         fontName: 'Arial',
     *         fontSize: 32,
     *     }
     * })
     *
     * // Update style dynamically
     * text.style = {
     *     fontSize: 30, // Change font size
     *     fill: 0x00ff00, // Change color to green
     *     align: 'right', // Change alignment to right
     *     stroke: { color: '#000000', width: 2 }, // Add black stroke
     * }
     */
    set style(style: TEXT_STYLE | Partial<TEXT_STYLE> | TEXT_STYLE_OPTIONS)
    {
        style ||= {};

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
     * The width of the sprite, setting this will actually modify the scale to achieve the value set.
     * @example
     * ```ts
     * // Set width directly
     * texture.width = 200;
     * console.log(texture.scale.x); // Scale adjusted to match width
     *
     * // For better performance when setting both width and height
     * texture.setSize(300, 400); // Avoids recalculating bounds twice
     * ```
     */
    override get width(): number
    {
        return Math.abs(this.scale.x) * this.bounds.width;
    }

    override set width(value: number)
    {
        this._setWidth(value, this.bounds.width);
    }

    /**
     * The height of the sprite, setting this will actually modify the scale to achieve the value set.
     * @example
     * ```ts
     * // Set height directly
     * texture.height = 200;
     * console.log(texture.scale.y); // Scale adjusted to match height
     *
     * // For better performance when setting both width and height
     * texture.setSize(300, 400); // Avoids recalculating bounds twice
     * ```
     */
    override get height(): number
    {
        return Math.abs(this.scale.y) * this.bounds.height;
    }

    override set height(value: number)
    {
        this._setHeight(value, this.bounds.height);
    }

    /**
     * Retrieves the size of the Text as a [Size]{@link Size} object based on the texture dimensions and scale.
     * This is faster than getting width and height separately as it only calculates the bounds once.
     * @example
     * ```ts
     * // Basic size retrieval
     * const text = new Text({
     *     text: 'Hello Pixi!',
     *     style: { fontSize: 24 }
     * });
     * const size = text.getSize();
     * console.log(`Size: ${size.width}x${size.height}`);
     *
     * // Reuse existing size object
     * const reuseSize = { width: 0, height: 0 };
     * text.getSize(reuseSize);
     * ```
     * @param out - Optional object to store the size in, to avoid allocating a new object
     * @returns The size of the Sprite
     * @see {@link Text#width} For getting just the width
     * @see {@link Text#height} For getting just the height
     * @see {@link Text#setSize} For setting both width and height
     */
    public override getSize(out?: Size): Size
    {
        out ||= {} as Size;
        out.width = Math.abs(this.scale.x) * this.bounds.width;
        out.height = Math.abs(this.scale.y) * this.bounds.height;

        return out;
    }

    /**
     * Sets the size of the Text to the specified width and height.
     * This is faster than setting width and height separately as it only recalculates bounds once.
     * @example
     * ```ts
     * // Basic size setting
     * const text = new Text({
     *    text: 'Hello Pixi!',
     *    style: { fontSize: 24 }
     * });
     * text.setSize(100, 200); // Width: 100, Height: 200
     *
     * // Set uniform size
     * text.setSize(100); // Sets both width and height to 100
     *
     * // Set size with object
     * text.setSize({
     *     width: 200,
     *     height: 300
     * });
     * ```
     * @param value - This can be either a number or a {@link Size} object
     * @param height - The height to set. Defaults to the value of `width` if not provided
     * @see {@link Text#width} For setting width only
     * @see {@link Text#height} For setting height only
     */
    public override setSize(value: number | Optional<Size, 'height'>, height?: number)
    {
        if (typeof value === 'object')
        {
            height = value.height ?? value.width;
            value = value.width;
        }
        else
        {
            height ??= value;
        }

        value !== undefined && this._setWidth(value, this.bounds.width);
        height !== undefined && this._setHeight(height, this.bounds.height);
    }

    /**
     * Checks if the object contains the given point in local coordinates.
     * Uses the text's bounds for hit testing.
     * @example
     * ```ts
     * // Basic point check
     * const localPoint = { x: 50, y: 25 };
     * const contains = text.containsPoint(localPoint);
     * console.log('Point is inside:', contains);
     * ```
     * @param point - The point to check in local coordinates
     * @returns True if the point is within the text's bounds
     * @see {@link Container#toLocal} For converting global coordinates to local
     */
    public override containsPoint(point: PointData)
    {
        const width = this.bounds.width;
        const height = this.bounds.height;

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
    public override onViewUpdate()
    {
        if (!this.didViewUpdate) this._didTextUpdate = true;
        super.onViewUpdate();
    }

    /**
     * Destroys this text renderable and optionally its style texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @example
     * // Destroys the text and its style
     * text.destroy({ style: true, texture: true, textureSource: true });
     * text.destroy(true);
     * text.destroy() // Destroys the text, but not its style
     */
    public override destroy(options: DestroyOptions = false): void
    {
        super.destroy(options);

        (this as any).owner = null;
        this._bounds = null;
        this._anchor = null;

        if (typeof options === 'boolean' ? options : options?.style)
        {
            this._style.destroy(options);
        }

        this._style = null;
        this._text = null;
    }
}

/**
 * Helper function to ensure consistent handling of text options across different text classes.
 * This function handles both the new options object format and the deprecated parameter format.
 * @example
 * // New recommended way:
 * const options = ensureTextOptions([{
 *     text: "Hello",
 *     style: { fontSize: 20 }
 * }], "Text");
 *
 * // Deprecated way (will show warning in debug):
 * const options = ensureTextOptions(["Hello", { fontSize: 20 }], "Text");
 * @param args - Arguments passed to text constructor
 * @param name - Name of the text class (used in deprecation warning)
 * @returns Normalized text options object
 * @template TEXT_OPTIONS - The type of the text options
 * @internal
 */
export function ensureTextOptions<
    TEXT_OPTIONS extends TextOptions
>(
    args: any[],
    name: string
): TEXT_OPTIONS
{
    let options = (args[0] ?? {}) as TEXT_OPTIONS;

    // @deprecated
    if (typeof options === 'string' || args[1])
    {
        // #if _DEBUG
        deprecation(v8_0_0, `use new ${name}({ text: "hi!", style }) instead`);
        // #endif

        options = {
            text: options,
            style: args[1],
        } as unknown as TEXT_OPTIONS;
    }

    return options;
}
