import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { Container } from '../container/Container';
import { definedProps } from '../container/utils/definedProps';
import { TextView } from './TextView';

import type { PointData } from '../../maths/point/PointData';
import type { PointLike } from '../../maths/point/PointLike';
import type { ContainerOptions } from '../container/Container';
import type { HTMLTextStyle, HTMLTextStyleOptions } from '../text-html/HtmlTextStyle';
import type { TextStyle } from './TextStyle';
import type { AnyTextStyle, AnyTextStyleOptions, TextString, TextViewOptions } from './TextView';

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
export type TextOptions = Partial<ContainerOptions<TextView>> & TextViewOptions &
{
    /** The anchor point of the text. */
    anchor?: PointLike,
    /** The copy for the text object. To split a line you can use '\n'. */
    text?: TextString;
    /** The resolution of the text. */
    resolution?: number;
    /** The text style */
    style?: TextStyle | HTMLTextStyleOptions | HTMLTextStyle;
};

/**
 * The abstract Text class, which acts as a base for {@link scene.Text}, {@link scene.BitmapText} and {@link scene.HTMLText}.
 * @memberof scene
 */
export abstract class AbstractText extends Container<TextView>
{
    constructor(view: TextView, options: TextOptions = {})
    {
        super({
            view,
            label: 'Text',
            ...options
        });

        this.allowChildren = false;
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
        return this.view.anchor;
    }

    set anchor(value: PointData)
    {
        this.view.anchor.x = value.x;
        this.view.anchor.y = value.y;
    }

    set text(value: TextString)
    {
        this.view.text = value;
    }

    /** The copy for the text object. To split a line you can use '\n'. */
    get text(): string
    {
        return this.view.text;
    }

    set style(value: AnyTextStyle | Partial<AnyTextStyle> | AnyTextStyleOptions)
    {
        this.view.style = value;
    }

    /** The style of the text. If setting the `style` can also be partial {@link scene.TextStyle}. */
    get style(): AnyTextStyle
    {
        return this.view.style;
    }

    /** Whether or not to round the x/y position of the sprite. */
    get roundPixels()
    {
        return !!this.view.roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this.view.roundPixels = value ? 1 : 0;
    }
}

/**
 * A Text object which is created using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).
 *
 * The primary advantage of this class over `BitmapText` is that you have great control over the style of the text,
 * which you can change at runtime.
 *
 * The primary disadvantages is that each piece of text has it's own texture, which can use more memory.
 * When text changes, this texture has to be re-generated and re-uploaded to the GPU, taking up time.
 *
 * A Text Object will create a line or multiple lines of text.
 *
 * To split a line you can use '\n' in your text string, or, on the `style` object,
 * change its `wordWrap` property to true and and give the `wordWrapWidth` property a value.
 * @example
 * import { Text } from 'pixi.js';
 *
 * const text = new Text({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 * @memberof scene
 */
export class Text extends AbstractText
{
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

        const { style, text, resolution, ...rest } = options as TextOptions;

        super(
            new TextView(definedProps({ style, text, resolution })),
            {
                label: 'Text',
                ...rest
            });

        this.allowChildren = false;
    }
}
