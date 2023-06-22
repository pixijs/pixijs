import { Container } from '../scene/Container';
import { TextView } from './TextView';

import type { ContainerOptions } from '../scene/Container';
import type { TextStyle } from './TextStyle';
import type { TextString, TextViewOptions } from './TextView';

export type TextOptions = ContainerOptions<TextView> & TextViewOptions;

export class Text extends Container<TextView>
{
    constructor(options: TextOptions)
    {
        super({
            view: new TextView(options),
            label: 'Text',
            ...options
        });
    }

    get anchor()
    {
        return this.view.anchor;
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
