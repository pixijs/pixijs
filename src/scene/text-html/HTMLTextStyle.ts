/* eslint-disable accessor-pairs */
import { warn } from '../../utils/logging/warn';
import { TextStyle } from '../text/TextStyle';
import { generateTextStyleKey } from '../text/utils/generateTextStyleKey';
import { textStyleToCSS } from './utils/textStyleToCSS';

import type { FillInput, StrokeInput } from '../graphics/shared/FillTypes';
import type { TextStyleOptions } from '../text/TextStyle';

/**
 * Options for HTML text style, extends {@link TextStyle}.
 * @memberof text
 * @extends text.TextStyleOptions
 * @property {string[]} [cssOverrides] - CSS style(s) to add.
 * @property {Record<string, text.HTMLTextStyleOptions>} [tagStyles] - Tag styles.
 */
export interface HTMLTextStyleOptions extends Omit<TextStyleOptions, 'leading' | 'textBaseline' | 'trim' >
{
    cssOverrides?: string[];
    tagStyles?: Record<string, HTMLTextStyleOptions>;
}

/**
 * A TextStyle object rendered by the HTMLTextSystem.
 * @memberof text
 */
export class HTMLTextStyle extends TextStyle
{
    private _cssOverrides: string[] = [];
    private _cssStyle: string;
    /**
     * List of styles per tag.
     * @example
     * new HTMLText({
     *   text:'<red>Red</red>,<blue>Blue</blue>,<green>Green</green>',
     *   style:{
     *       fontFamily: 'DM Sans',
     *       fill: 'white',
     *       fontSize:100,
     *       tagStyles:{
     *           red:{
     *               fill:'red',
     *           },
     *           blue:{
     *               fill:'blue',
     *           },
     *           green:{
     *               fill:'green',
     *           }
     *       }
     *   }
     * );
     */
    public tagStyles: Record<string, HTMLTextStyleOptions>;

    constructor(options: HTMLTextStyleOptions = {})
    {
        super(options);

        this.cssOverrides ??= options.cssOverrides;
        this.tagStyles = options.tagStyles ?? {};
    }

    /** List of style overrides that will be applied to the HTML text. */
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

    /**
     * Creates a new HTMLTextStyle object with the same values as this one.
     * @returns New cloned HTMLTextStyle object
     */
    public clone(): HTMLTextStyle
    {
        return new HTMLTextStyle({
            align: this.align,
            breakWords: this.breakWords,
            dropShadow: this.dropShadow ? { ...this.dropShadow } : null,
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

    override set fill(value: FillInput)
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

    override set stroke(value: StrokeInput)
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
