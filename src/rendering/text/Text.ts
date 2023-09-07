import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { Container } from '../scene/Container';
import { TextView } from './TextView';

import type { PointData } from '../../maths/PointData';
import type { PointLike } from '../../maths/PointLike';
import type { ContainerOptions } from '../scene/Container';
import type { TextStyle } from './TextStyle';
import type { TextString, TextViewOptions } from './TextView';

export type TextOptions = ContainerOptions<TextView> & TextViewOptions;

export class Text extends Container<TextView>
{
    constructor(text: TextString, options?: Partial<TextStyle>);
    /** @deprecated since 8.0.0 */
    constructor(options: TextOptions);
    constructor(...args: [TextOptions] | [TextString, Partial<TextStyle>])
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

        super({
            view: new TextView(options as TextOptions),
            label: 'Text',
            ...options as TextOptions
        });
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

    set style(value: TextStyle | Partial<TextStyle>)
    {
        this.view.style = value;
    }

    get style(): TextStyle
    {
        return this.view.style;
    }
}

/** @deprecated 8.0.0 */
export class BitmapText extends Text
{
    /** @deprecated since 8.0.0 */
    constructor(text: TextString, options?: Partial<TextStyle>);
    constructor(options: TextOptions);
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
