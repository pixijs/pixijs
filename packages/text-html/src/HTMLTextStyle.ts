import { settings, utils } from '@pixi/core';
import { TextStyle } from '@pixi/text';

import type {
    ITextStyle,
    TextStyleFontStyle,
    TextStyleFontWeight,
    TextStyleLineJoin,
    TextStyleTextBaseline
} from '@pixi/text';

/**
 * HTMLText support more white-space options.
 * @memberof PIXI
 * @since 7.2.0
 * @see PIXI.IHTMLTextStyle
 */
export type HTMLTextStyleWhiteSpace = 'normal' | 'pre' | 'pre-line' | 'nowrap' | 'pre-wrap';

/**
 * FontFace display options.
 * @memberof PIXI
 * @since 7.3.0
 */
export type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional';

// Subset of ITextStyle
type ITextStyleIgnore = 'whiteSpace'
| 'fillGradientStops'
| 'fillGradientType'
| 'miterLimit'
| 'textBaseline'
| 'trim'
| 'leading'
| 'lineJoin';

/**
 * Modifed versions from ITextStyle.
 * @memberof PIXI
 * @extends PIXI.ITextStyle
 * @since 7.2.0
 */
export interface IHTMLTextStyle extends Omit<ITextStyle, ITextStyleIgnore>
{
    /** White-space with expanded options. */
    whiteSpace: HTMLTextStyleWhiteSpace;
}

export interface IHTMLTextFontOptions extends Pick<IHTMLFont, 'weight' | 'style' | 'family'>
{
    /** font-display property */
    display: FontDisplay;
}

/**
 * Font information for HTMLText
 * @memberof PIXI
 * @since 7.2.0
 */
export interface IHTMLFont
{
    /** User-supplied URL request */
    originalUrl: string;
    /** Base64 string for font */
    dataSrc: string;
    /** FontFace installed in the document */
    fontFace: FontFace | null;
    /** Blob-based URL for font */
    src: string;
    /** Family name of font */
    family: string;
    /** Weight of the font */
    weight: TextStyleFontWeight;
    /** Style of the font */
    style: TextStyleFontStyle;
    /** Display property of the font */
    display: FontDisplay;
    /** Reference counter */
    refs: number;
}

/**
 * Used internally to restrict text style usage and convert easily to CSS.
 * @class
 * @memberof PIXI
 * @param {PIXI.ITextStyle|PIXI.IHTMLTextStyle} [style] - Style to copy.
 * @since 7.2.0
 */
export class HTMLTextStyle extends TextStyle
{
    /** The collection of installed fonts */
    public static availableFonts: Record<string, IHTMLFont> = {};

    /**
     * List of default options, these are largely the same as TextStyle,
     * with the exception of whiteSpace, which is set to 'normal' by default.
     */
    public static readonly defaultOptions: IHTMLTextStyle = {
        /** Align */
        align: 'left',
        /** Break words */
        breakWords: false,
        /** Drop shadow */
        dropShadow: false,
        /** Drop shadow alpha */
        dropShadowAlpha: 1,
        /**
         * Drop shadow angle
         * @type {number}
         * @default Math.PI / 6
         */
        dropShadowAngle: Math.PI / 6,
        /** Drop shadow blur */
        dropShadowBlur: 0,
        /** Drop shadow color */
        dropShadowColor: 'black',
        /** Drop shadow distance */
        dropShadowDistance: 5,
        /** Fill */
        fill: 'black',
        /** Font family */
        fontFamily: 'Arial',
        /** Font size */
        fontSize: 26,
        /** Font style */
        fontStyle: 'normal',
        /** Font variant */
        fontVariant: 'normal',
        /** Font weight */
        fontWeight: 'normal',
        /** Letter spacing */
        letterSpacing: 0,
        /** Line height */
        lineHeight: 0,
        /** Padding */
        padding: 0,
        /** Stroke */
        stroke: 'black',
        /** Stroke thickness */
        strokeThickness: 0,
        /** White space */
        whiteSpace: 'normal',
        /** Word wrap */
        wordWrap: false,
        /** Word wrap width */
        wordWrapWidth: 100,
    };

    /** For using custom fonts */
    private _fonts: IHTMLFont[] = [];

    /** List of internal style rules */
    private _overrides: string[] = [];

    /** Global rules or stylesheet, useful for creating rules for rendering */
    private _stylesheet = '';

    /** Track font changes internally */
    private fontsDirty = false;

    /**
     * Convert a TextStyle to HTMLTextStyle
     * @param originalStyle
     * @example
     * import {TextStyle } from 'pixi.js';
     * import {HTMLTextStyle} from '@pixi/text-html';
     * const style = new TextStyle();
     * const htmlStyle = HTMLTextStyle.from(style);
     */
    static from(originalStyle: TextStyle | Partial<IHTMLTextStyle>): HTMLTextStyle
    {
        return new HTMLTextStyle(Object.keys(HTMLTextStyle.defaultOptions)
            .reduce((obj, prop) => ({ ...obj, [prop]: originalStyle[prop as keyof IHTMLTextStyle] }), {})
        );
    }

    /** Clear the current font */
    public cleanFonts(): void
    {
        if (this._fonts.length > 0)
        {
            this._fonts.forEach((font) =>
            {
                URL.revokeObjectURL(font.src);
                font.refs--;
                if (font.refs === 0)
                {
                    if (font.fontFace)
                    {
                        document.fonts.delete(font.fontFace);
                    }
                    delete HTMLTextStyle.availableFonts[font.originalUrl];
                }
            });
            this.fontFamily = 'Arial';
            this._fonts.length = 0;
            this.styleID++;
            this.fontsDirty = true;
        }
    }

    /**
     * Because of how HTMLText renders, fonts need to be imported
     * @param url
     * @param options
     */
    public loadFont(url: string, options: Partial<IHTMLTextFontOptions> = {}): Promise<void>
    {
        const { availableFonts } = HTMLTextStyle;

        // Font is already installed
        if (availableFonts[url])
        {
            const font = availableFonts[url];

            this._fonts.push(font);
            font.refs++;
            this.styleID++;
            this.fontsDirty = true;

            return Promise.resolve();
        }

        return settings.ADAPTER.fetch(url)
            .then((response) => response.blob())
            .then(async (blob) => new Promise<[string, string]>((resolve, reject) =>
            {
                const src = URL.createObjectURL(blob);
                const reader = new FileReader();

                reader.onload = () => resolve([src, reader.result as string]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }))
            .then(async ([src, dataSrc]) =>
            {
                const font: IHTMLFont = Object.assign({
                    family: utils.path.basename(url, utils.path.extname(url)),
                    weight: 'normal',
                    style: 'normal',
                    display: 'auto',
                    src,
                    dataSrc,
                    refs: 1,
                    originalUrl: url,
                    fontFace: null,
                }, options);

                availableFonts[url] = font;
                this._fonts.push(font);
                this.styleID++;

                // Load it into the current DOM so we can properly measure it!
                const fontFace = new FontFace(font.family, `url(${font.src})`, {
                    weight: font.weight,
                    style: font.style,
                    display: font.display,
                });

                // Keep this reference so we can remove it later from document
                font.fontFace = fontFace;

                await fontFace.load();
                document.fonts.add(fontFace);
                await document.fonts.ready;

                this.styleID++;
                this.fontsDirty = true;
            });
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
        const toAdd = value.filter((v) => !this._overrides.includes(v));

        if (toAdd.length > 0)
        {
            this._overrides.push(...toAdd);
            this.styleID++;
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
        const toRemove = value.filter((v) => this._overrides.includes(v));

        if (toRemove.length > 0)
        {
            this._overrides = this._overrides.filter((v) => !toRemove.includes(v));
            this.styleID++;
        }
    }

    /**
     * Internally converts all of the style properties into CSS equivalents.
     * @param scale
     * @returns The CSS style string, for setting `style` property of root HTMLElement.
     */
    public toCSS(scale: number): string
    {
        return [
            `transform: scale(${scale})`,
            `transform-origin: top left`,
            'display: inline-block',
            `color: ${this.normalizeColor(this.fill)}`,
            `font-size: ${(this.fontSize as number)}px`,
            `font-family: ${this.fontFamily}`,
            `font-weight: ${this.fontWeight}`,
            `font-style: ${this.fontStyle}`,
            `font-variant: ${this.fontVariant}`,
            `letter-spacing: ${this.letterSpacing}px`,
            `text-align: ${this.align}`,
            `padding: ${this.padding}px`,
            `white-space: ${this.whiteSpace}`,
            ...this.lineHeight ? [`line-height: ${this.lineHeight}px`] : [],
            ...this.wordWrap ? [
                `word-wrap: ${this.breakWords ? 'break-all' : 'break-word'}`,
                `max-width: ${this.wordWrapWidth}px`
            ] : [],
            ...this.strokeThickness ? [
                `-webkit-text-stroke-width: ${this.strokeThickness}px`,
                `-webkit-text-stroke-color: ${this.normalizeColor(this.stroke)}`,
                `text-stroke-width: ${this.strokeThickness}px`,
                `text-stroke-color: ${this.normalizeColor(this.stroke)}`,
                'paint-order: stroke',
            ] : [],
            ...this.dropShadow ? [this.dropShadowToCSS()] : [],
            ...this._overrides,
        ].join(';');
    }

    /** Get the font CSS styles from the loaded font, If available. */
    public toGlobalCSS(): string
    {
        return this._fonts.reduce((result, font) => (
            `${result}
            @font-face {
                font-family: "${font.family}";
                src: url('${font.dataSrc}');
                font-weight: ${font.weight};
                font-style: ${font.style};
                font-display: ${font.display};
            }`
        ), this._stylesheet);
    }

    /** Internal stylesheet contents, useful for creating rules for rendering */
    public get stylesheet(): string
    {
        return this._stylesheet;
    }
    public set stylesheet(value: string)
    {
        if (this._stylesheet !== value)
        {
            this._stylesheet = value;
            this.styleID++;
        }
    }

    /**
     * Convert numerical colors into hex-strings
     * @param color
     */
    private normalizeColor(color: any): string
    {
        if (Array.isArray(color))
        {
            color = utils.rgb2hex(color);
        }

        if (typeof color === 'number')
        {
            return utils.hex2string(color);
        }

        return color;
    }

    /** Convert the internal drop-shadow settings to CSS text-shadow */
    private dropShadowToCSS(): string
    {
        let color = this.normalizeColor(this.dropShadowColor);
        const alpha = this.dropShadowAlpha;
        const x = Math.round(Math.cos(this.dropShadowAngle) * this.dropShadowDistance);
        const y = Math.round(Math.sin(this.dropShadowAngle) * this.dropShadowDistance);

        // Append alpha to color
        if (color.startsWith('#') && alpha < 1)
        {
            color += (alpha * 255 | 0).toString(16).padStart(2, '0');
        }

        const position = `${x}px ${y}px`;

        if (this.dropShadowBlur > 0)
        {
            return `text-shadow: ${position} ${this.dropShadowBlur}px ${color}`;
        }

        return `text-shadow: ${position} ${color}`;
    }

    /** Resets all properties to the defaults specified in TextStyle.prototype._default */
    public reset(): void
    {
        Object.assign(this, HTMLTextStyle.defaultOptions);
    }

    /**
     * Called after the image is loaded but before drawing to the canvas.
     * Mostly used to handle Safari's font loading bug.
     * @ignore
     */
    public onBeforeDraw()
    {
        const { fontsDirty: prevFontsDirty } = this;

        this.fontsDirty = false;

        // Safari has a known bug where embedded fonts are not available
        // immediately after the image loads, to compensate we wait an
        // arbitrary amount of time
        // @see https://bugs.webkit.org/show_bug.cgi?id=219770
        if (this.isSafari && this._fonts.length > 0 && prevFontsDirty)
        {
            return new Promise<void>((resolve) => setTimeout(resolve, 100));
        }

        return Promise.resolve();
    }

    /**
     * Proving that Safari is the new IE
     * @ignore
     */
    private get isSafari(): boolean
    {
        const { userAgent } = settings.ADAPTER.getNavigator();

        return (/^((?!chrome|android).)*safari/i).test(userAgent);
    }

    override set fillGradientStops(_value: number[])
    {
        console.warn('[HTMLTextStyle] fillGradientStops is not supported by HTMLText');
    }
    override get fillGradientStops()
    {
        return super.fillGradientStops;
    }

    override set fillGradientType(_value: number)
    {
        console.warn('[HTMLTextStyle] fillGradientType is not supported by HTMLText');
    }
    override get fillGradientType()
    {
        return super.fillGradientType;
    }

    override set miterLimit(_value: number)
    {
        console.warn('[HTMLTextStyle] miterLimit is not supported by HTMLText');
    }
    override get miterLimit()
    {
        return super.miterLimit;
    }

    override set trim(_value: boolean)
    {
        console.warn('[HTMLTextStyle] trim is not supported by HTMLText');
    }
    override get trim()
    {
        return super.trim;
    }

    override set textBaseline(_value: TextStyleTextBaseline)
    {
        console.warn('[HTMLTextStyle] textBaseline is not supported by HTMLText');
    }
    override get textBaseline()
    {
        return super.textBaseline;
    }

    override set leading(_value: number)
    {
        console.warn('[HTMLTextStyle] leading is not supported by HTMLText');
    }
    override get leading()
    {
        return super.leading;
    }

    override set lineJoin(_value: TextStyleLineJoin)
    {
        console.warn('[HTMLTextStyle] lineJoin is not supported by HTMLText');
    }
    override get lineJoin()
    {
        return super.lineJoin;
    }
}
