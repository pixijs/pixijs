import { textStyleToCSS } from './html/utils/textStyleToCSS';
import { generateTextStyleKey } from './shared/utils/generateTextStyleKey';
import { TextStyle } from './TextStyle';

import type { TextStyleOptions } from './TextStyle';

export interface HTMLTextStyleOptions extends TextStyleOptions
{
    cssOverrides?: string[];
}

export class HTMLTextStyle extends TextStyle
{
    private _cssOverrides: string[] = [];
    private _cssStyle: string;

    constructor(options: HTMLTextStyleOptions)
    {
        super(options);

        this.cssOverrides ??= options.cssOverrides;
    }

    set cssOverrides(value: string | string[])
    {
        this._cssOverrides = value instanceof Array ? value : [value];
        this.update();
    }

    get cssOverrides(): string[]
    {
        return this._cssOverrides;
    }

    protected override _generateKey(): string
    {
        this._styleKey = generateTextStyleKey(this) + this._cssOverrides.join('-');

        return this._styleKey;
    }

    public update()
    {
        this._cssStyle = null;
        super.update();
    }

    public clone(): HTMLTextStyle
    {
        return new HTMLTextStyle({
            align: this.align,
            breakWords: this.breakWords,
            dropShadow: this.dropShadow,
            fill: this._fill,
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
            fontStyle: this.fontStyle,
            fontVariant: this.fontVariant,
            fontWeight: this.fontWeight,
            leading: this.leading,
            letterSpacing: this.letterSpacing,
            lineHeight: this.lineHeight,
            padding: this.padding,
            stroke: this._stroke,
            textBaseline: this.textBaseline,
            whiteSpace: this.whiteSpace,
            wordWrap: this.wordWrap,
            wordWrapWidth: this.wordWrapWidth,
            cssOverrides: this.cssOverrides,
        });
    }

    get cssStyle(): string
    {
        if (!this._cssStyle)
        {
            this._cssStyle = textStyleToCSS(this);
        }

        return this._cssStyle;
    }
}
