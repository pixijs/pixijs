/* eslint-disable accessor-pairs */
import { warn } from '../../utils/logging/warn';
import { TextStyle } from '../text/TextStyle';
import { generateTextStyleKey } from '../text/utils/generateTextStyleKey';
import { textStyleToCSS } from './utils/textStyleToCSS';

import type { FillStyleInputs } from '../graphics/shared/GraphicsContext';
import type { TextStyleOptions } from '../text/TextStyle';

export interface HTMLTextStyleOptions extends Omit<TextStyleOptions, 'leading' | 'textBaseline' | 'trim' >
{
    cssOverrides?: string[];
    tagStyles?: Record<string, HTMLTextStyleOptions>;
}

export class HTMLTextStyle extends TextStyle
{
    private _cssOverrides: string[] = [];
    private _cssStyle: string;
    public tagStyles: Record<string, HTMLTextStyleOptions>;

    constructor(options: HTMLTextStyleOptions = {})
    {
        super(options);

        this.cssOverrides ??= options.cssOverrides;
        this.tagStyles = options.tagStyles ?? {};
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
            letterSpacing: this.letterSpacing,
            lineHeight: this.lineHeight,
            padding: this.padding,
            stroke: this._stroke,
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

    /**
     * Add a style override, this can be any CSS property
     * it will override any built-in style. This is the
     * property and the value as a string (e.g., `color: red`).
     * This will override any other internal style.
     * @param {string} value - CSS style(s) to add.
     * @example
     * style.addOverride('background-color: red');
     */
    public addOverride(...value: string[]): void
    {
        const toAdd = value.filter((v) => !this.cssOverrides.includes(v));

        if (toAdd.length > 0)
        {
            this.cssOverrides.push(...toAdd);
            this.update();
        }
    }

    /**
     * Remove any overrides that match the value.
     * @param {string} value - CSS style to remove.
     * @example
     * style.removeOverride('background-color: red');
     */
    public removeOverride(...value: string[]): void
    {
        const toRemove = value.filter((v) => this.cssOverrides.includes(v));

        if (toRemove.length > 0)
        {
            this.cssOverrides = this.cssOverrides.filter((v) => !toRemove.includes(v));
            this.update();
        }
    }

    override set fill(value: FillStyleInputs)
    {
        // if its not a string or a number, then its a texture!
        if (typeof value !== 'string' && typeof value !== 'number')
        {
            // #if _DEBUG
            warn('[HTMLTextStyle] only color fill is not supported by HTMLText');
            // #endif
        }

        super.fill = value;
    }

    override set stroke(value: FillStyleInputs)
    {
        // if its not a string or a number, then its a texture!
        if (value && typeof value !== 'string' && typeof value !== 'number')
        {
            // #if _DEBUG
            warn('[HTMLTextStyle] only color stroke is not supported by HTMLText');
            // #endif
        }

        super.stroke = value;
    }
}
