import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { Container } from '../container/Container';
import { definedProps } from '../container/utils/definedProps';
import { TextView } from './TextView';

import type { PointData } from '../../maths/point/PointData';
import type { PointLike } from '../../maths/point/PointLike';
import type { ContainerOptions } from '../container/Container';
import type { HTMLTextStyle } from './html/HtmlTextStyle';
import type { TextStyle } from './TextStyle';
import type { AnyTextStyle, TextString, TextViewOptions } from './TextView';

export type TextOptions = Partial<ContainerOptions<TextView>> & TextViewOptions &
{
    anchor?: PointLike
};

export class Text extends Container<TextView>
{
    constructor(options: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text: TextString, options?: Partial<AnyTextStyle>);
    constructor(...args: [TextOptions] | [TextString, Partial<AnyTextStyle>])
    {
        let options = args[0];

        // @deprecated
        if (typeof options === 'string' || args[1])
        {
            deprecation(v8_0_0, 'use new Text({ text: "hi!", style }) instead');
            options = {
                text: options,
                style: args[1],
            } as TextOptions;
        }

        const { style, text, renderMode, resolution, ...rest } = options as TextOptions;

        super({
            view: new TextView(definedProps({ style, text, renderMode, resolution })),
            label: 'Text',
            ...rest
        });

        this.allowChildren = false;
    }

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

    get text(): string
    {
        return this.view.text;
    }

    set style(value: AnyTextStyle | Partial<AnyTextStyle>)
    {
        this.view.style = value;
    }

    get style(): AnyTextStyle
    {
        return this.view.style;
    }

    get roundPixels()
    {
        return !!this.view.roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this.view.roundPixels = value ? 1 : 0;
    }
}

/** @deprecated 8.0.0 */
export class BitmapText extends Text
{
    constructor(options: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text: TextString, options?: Partial<TextStyle>);
    constructor(...args: [TextOptions] | [TextString, Partial<TextStyle>])
    {
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'use new Text({ text: "hi!", style, renderMode: "bitmap" }) instead');

        let options: TextOptions = args[0] as TextOptions;

        // @deprecated
        if (typeof options === 'string' || args[1])
        {
            options = {
                text: options,
                style: args[1],
            } as TextOptions;
        }

        options.renderMode = 'bitmap';

        super(options);
    }
}

/** @deprecated since 8.0.0 */
export class HTMLText extends Text
{
    constructor(options: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text: TextString, options?: Partial<HTMLTextStyle>);
    constructor(...args: [TextOptions] | [TextString, Partial<HTMLTextStyle>])
    {
        // eslint-disable-next-line max-len
        deprecation(v8_0_0, 'use new Text({ text: "hi!", style, renderMode: "html" }) instead');

        let options: TextOptions = args[0] as TextOptions;

        // @deprecated
        if (typeof options === 'string' || args[1])
        {
            options = {
                text: options,
                style: args[1],
            } as TextOptions;
        }

        options.renderMode = 'html';

        super(options);
    }
}
