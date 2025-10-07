/* eslint-disable accessor-pairs */
import { warn } from '../../utils/logging/warn';
import { TextStyle } from '../text/TextStyle';
import { textStyleToCSS } from './utils/textStyleToCSS';

import type { FillInput, StrokeInput } from '../graphics/shared/FillTypes';
import type { TextStyleOptions } from '../text/TextStyle';

/**
 * Options for HTML text style, extends standard text styling with HTML-specific capabilities.
 * Omits certain base text properties that don't apply to HTML rendering.
 * @example
 * ```ts
 * // Basic HTML text style
 * const text = new HTMLText({
 *     text: '<p>Hello World</p>',
 *     style: {
 *         fontSize: 24,
 *         fill: '#ff0000',
 *         fontFamily: 'Arial',
 *         align: 'center'
 *     }
 * });
 *
 * // Custom tag styling
 * const taggedText = new HTMLText({
 *     text: '<custom>Custom Tag</custom>',
 *     style: {
 *         fontSize: 16,
 *         tagStyles: {
 *             custom: {
 *                 fontSize: 32,
 *                 fill: '#00ff00',
 *                 fontStyle: 'italic'
 *             }
 *         }
 *     }
 * });
 * ```
 * @category text
 * @standard
 */
export interface HTMLTextStyleOptions extends Omit<TextStyleOptions, 'leading' | 'textBaseline' | 'trim' | 'filters'>
{
    /**
     * List of CSS style overrides to apply to the HTML text.
     * These styles are added after the built-in styles and can override any default styling.
     * @advanced
     */
    cssOverrides?: string[];

    /**
     * Custom styles to apply to specific HTML tags.
     * Allows for consistent styling of custom elements without CSS overrides.
     * @example
     * ```ts
     * const text = new HTMLText({
     *     text: `
     *         <red>Main Title</red>
     *         <grey>The subtitle</grey>
     *         <blue>Regular content text</blue>
     *     `,
     *     style: {
     *         tagStyles: {
     *             red: {
     *                 fill: '#ff0000',
     *             },
     *             grey: {
     *                 fill: '#666666',
     *             },
     *             blue: {
     *                 fill: 'blue',
     *             }
     *         }
     *     }
     * });
     * ```
     * @standard
     */
    tagStyles?: Record<string, HTMLTextStyleOptions>;
}

/**
 * A TextStyle object rendered by the HTMLTextSystem.
 * @category text
 */
export class HTMLTextStyle extends TextStyle
{
    private _cssOverrides: string[] = [];
    private _cssStyle: string;
    /**
     * Custom styles to apply to specific HTML tags.
     * Allows for consistent styling of custom elements without CSS overrides.
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
     * @standard
     */
    public tagStyles: Record<string, HTMLTextStyleOptions>;

    constructor(options: HTMLTextStyleOptions = {})
    {
        super(options);

        this.cssOverrides = options.cssOverrides ?? [];
        this.tagStyles = options.tagStyles ?? {};
    }

    /**
     * List of CSS style overrides to apply to the HTML text.
     * These styles are added after the built-in styles and can override any default styling.
     * @advanced
     */
    set cssOverrides(value: string | string[])
    {
        this._cssOverrides = value instanceof Array ? value : [value];
        this.update();
    }

    /** @advanced */
    get cssOverrides(): string[]
    {
        return this._cssOverrides;
    }

    /**
     * Updates the text style and triggers a refresh of the CSS style cache.
     * This method is called automatically when style properties are changed.
     * @example
     * ```ts
     * // Update after multiple changes
     * const text = new HTMLText({
     *     text: 'Hello World',
     *     style
     * });
     *
     * style.fontSize = 32;
     * style.fill = '#00ff00';
     * style.fontFamily = 'Arial';
     * style.update(); // Apply all changes at once
     * ```
     * @advanced
     * @see {@link HTMLTextStyle#cssStyle} For accessing the generated CSS
     * @see {@link HTMLTextStyle#cssOverrides} For managing CSS overrides
     */
    public update()
    {
        this._cssStyle = null;
        super.update();
    }

    /**
     * Creates a new HTMLTextStyle object with the same values as this one.
     * This creates a deep copy of all style properties, including dropShadow and tag styles.
     * @example
     * ```ts
     * // Create original style
     * const originalStyle = new HTMLTextStyle({
     *     fontSize: 24,
     *     fill: '#ff0000',
     *     tagStyles: {
     *         header: { fontSize: 32, fill: '#00ff00' }
     *     }
     * });
     *
     * // Clone the style
     * const clonedStyle = originalStyle.clone();
     *
     * // Modify cloned style independently
     * clonedStyle.fontSize = 36;
     * clonedStyle.fill = '#0000ff';
     *
     * // Original style remains unchanged
     * console.log(originalStyle.fontSize); // Still 24
     * console.log(originalStyle.fill); // Still '#ff0000'
     * ```
     *
     * Properties that are cloned:
     * - Basic text properties (fontSize, fontFamily, etc.)
     * - Fill and stroke styles
     * - Drop shadow configuration
     * - CSS overrides
     * - Tag styles (deep copied)
     * - Word wrap settings
     * - Alignment and spacing
     * @returns {HTMLTextStyle} A new HTMLTextStyle instance with the same properties
     * @see {@link HTMLTextStyle} For available style properties
     * @see {@link HTMLTextStyle#cssOverrides} For CSS override handling
     * @see {@link HTMLTextStyle#tagStyles} For tag style configuration
     * @standard
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
            tagStyles: { ...this.tagStyles },
        });
    }

    /**
     * The CSS style string that will be applied to the HTML text.
     * @advanced
     */
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
     * @advanced
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
     * @advanced
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

    /**
     * Sets the fill style for the text. HTML text only supports color fills (string or number values).
     * Texture fills are not supported and will trigger a warning in debug mode.
     * @example
     * ```ts
     * // Using hex colors
     * const text = new HTMLText({
     *     text: 'Colored Text',
     *     style: {
     *         fill: 0xff0000 // Red color
     *     }
     * });
     *
     * // Using CSS color strings
     * text.style.fill = '#00ff00';     // Hex string (Green)
     * text.style.fill = 'blue';        // Named color
     * text.style.fill = 'rgb(255,0,0)' // RGB
     * text.style.fill = '#f0f';        // Short hex
     *
     * // Invalid usage (will trigger warning in debug)
     * text.style.fill = {
     *     type: 'pattern',
     *     texture: Texture.from('pattern.png')
     * }; // Not supported, falls back to default
     * ```
     * @param value - The fill color to use. Must be a string or number.
     * @throws {Warning} In debug mode when attempting to use unsupported fill types
     * @see {@link TextStyle#fill} For full fill options in canvas text
     * @standard
     */
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

    /**
     * Sets the stroke style for the text. HTML text only supports color strokes (string or number values).
     * Texture strokes are not supported and will trigger a warning in debug mode.
     * @example
     * ```ts
     * // Using hex colors
     * const text = new HTMLText({
     *     text: 'Outlined Text',
     *     style: {
     *         stroke: 0xff0000 // Red outline
     *     }
     * });
     *
     * // Using CSS color strings
     * text.style.stroke = '#00ff00';     // Hex string (Green)
     * text.style.stroke = 'blue';        // Named color
     * text.style.stroke = 'rgb(255,0,0)' // RGB
     * text.style.stroke = '#f0f';        // Short hex
     *
     * // Using stroke width
     * text.style = {
     *     stroke: {
     *         color: '#ff0000',
     *         width: 2
     *     }
     * };
     *
     * // Remove stroke
     * text.style.stroke = null;
     *
     * // Invalid usage (will trigger warning in debug)
     * text.style.stroke = {
     *     type: 'pattern',
     *     texture: Texture.from('pattern.png')
     * }; // Not supported, falls back to default
     * ```
     * @param value - The stroke style to use. Must be a string, number, or stroke configuration object
     * @throws {Warning} In debug mode when attempting to use unsupported stroke types
     * @see {@link TextStyle#stroke} For full stroke options in canvas text
     * @standard
     */
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
