import { warn } from '../../utils/logging/warn';
import { AbstractText, ensureTextOptions } from '../text/AbstractText';
import { TextStyle } from '../text/TextStyle';
import { BitmapFontManager } from './BitmapFontManager';
import { type BitmapTextGraphics } from './BitmapTextPipe';

import type { View } from '../../rendering/renderers/shared/view/View';
import type { TextOptions, TextString } from '../text/AbstractText';
import type { TextStyleOptions } from '../text/TextStyle';

// eslint-disable-next-line requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface BitmapText extends PixiMixins.BitmapText, AbstractText<
    TextStyle,
    TextStyleOptions,
    TextOptions,
    BitmapTextGraphics
> {}

/**
 * A BitmapText object creates text using pre-rendered bitmap fonts.
 * It supports both loaded bitmap fonts (XML/FNT) and dynamically generated ones.
 *
 * To split a line you can use '\n' in your text string, or use the `wordWrap` and
 * `wordWrapWidth` style properties.
 *
 * Key Features:
 * - High-performance text rendering using pre-generated textures
 * - Support for both pre-loaded and dynamic bitmap fonts
 * - Compatible with MSDF/SDF fonts for crisp scaling
 * - Automatic font reuse and optimization
 *
 * Performance Benefits:
 * - Faster rendering compared to Canvas/HTML text
 * - Lower memory usage for repeated characters
 * - More efficient text changes
 * - Better batching capabilities
 *
 * Limitations:
 * - Full character set support is impractical due to the number of chars (mainly affects CJK languages)
 * - Initial font generation/loading overhead
 * - Less flexible styling compared to Canvas/HTML text
 * @example
 * ```ts
 * import { BitmapText, BitmapFont } from 'pixi.js';
 *
 * // Dynamic font generation
 * const dynamicText = new BitmapText({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 *
 * // Pre-installed font usage
 * BitmapFont.install({
 *    name: 'myFont',
 *    style: {
 *        fontFamily: 'Arial',
 *    }
 * });
 *
 * const preinstalledText = new BitmapText({
 *     text: 'Hello Pixi!',
 *     style: {
 *        fontFamily: 'myFont',
 *        fontSize: 24,
 *        fill: 0xff1010,
 *        align: 'center',
 *     }
 * });
 *
 * // Load and use external bitmap font, if the font supports MSDF/SDF then it will be used
 * const font = await Assets.load('fonts/myFont.fnt');
 *
 * const loadedFontText = new BitmapText({
 *     text: 'Hello Pixi!',
 *     style: {
 *        fontFamily: 'myLoadedFont', // Name from .fnt file
 *        fontSize: 24,
 *        fill: 0xff1010,
 *        align: 'center',
 *     }
 * });
 *
 * // Multiline text with word wrap
 * const wrappedText = new BitmapText({
 *     text: 'This is a long text that will wrap automatically',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         wordWrap: true,
 *         wordWrapWidth: 200,
 *     }
 * });
 * ```
 *
 * Font Types:
 * 1. Pre-loaded Bitmap Fonts:
 *    - Load via Asset Manager (XML/FNT formats)
 *    - Support for MSDF/SDF fonts
 *    - Create using tools like https://msdf-bmfont.donmccurdy.com/
 *
 * 2. Dynamic Bitmap Fonts:
 *    - Generated at runtime from system fonts
 *    - Automatic font reuse and optimization
 *    - Smart scaling for similar font sizes
 *
 * Font Management:
 * - Automatic font generation when needed
 * - Manual pre-installation via `BitmapFont.install`
 * - Smart font reuse to optimize memory
 * - Scale existing fonts instead of generating new ones when possible
 * @category text
 * @standard
 * @see {@link BitmapFont} For font installation and management
 * @see {@link Text} For canvas-based text rendering
 * @see {@link HTMLText} For HTML/CSS-based text rendering
 */
export class BitmapText extends AbstractText<
    TextStyle,
    TextStyleOptions,
    TextOptions,
    BitmapTextGraphics
> implements View
{
    /** @internal */
    public override readonly renderPipeId: string = 'bitmapText';

    /**
     * **Note:** Our docs parser struggles to properly understand the constructor signature.
     * This is the correct signature.
     * ```ts
     * new BitmapText(options?: TextOptions);
     * ```
     * @param { TextOptions } options - The options of the bitmap text.
     */
    constructor(options?: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text?: TextString, options?: Partial<TextStyle>);
    constructor(...args: [TextOptions?] | [TextString, Partial<TextStyle>])
    {
        const options = ensureTextOptions(args, 'BitmapText');

        options.style ??= options.style || {};
        options.style.fill ??= 0xffffff;

        super(options, TextStyle);
    }

    /** @private */
    protected updateBounds()
    {
        const bounds = this._bounds;
        const anchor = this._anchor;

        const bitmapMeasurement = BitmapFontManager.measureText(this.text, this._style);
        const scale = bitmapMeasurement.scale;
        const offset = bitmapMeasurement.offsetY * scale;

        let width = bitmapMeasurement.width * scale;
        let height = bitmapMeasurement.height * scale;

        const stroke = this._style._stroke;

        if (stroke)
        {
            width += stroke.width;
            height += stroke.width;
        }

        bounds.minX = (-anchor._x * width);
        bounds.maxX = bounds.minX + width;
        bounds.minY = (-anchor._y * (height + offset));
        bounds.maxY = bounds.minY + height;
    }

    /**
     * The resolution / device pixel ratio for text rendering.
     * Unlike other text types, BitmapText resolution is managed by the BitmapFont.
     * Individual resolution changes are not supported.
     * @example
     * ```ts
     * // ❌ Incorrect: Setting resolution directly (will trigger warning)
     * const text = new BitmapText({
     *     text: 'Hello',
     *     resolution: 2 // This will be ignored
     * });
     *
     * // ✅ Correct: Set resolution when installing the font
     * BitmapFont.install({
     *     name: 'MyFont',
     *     style: {
     *         fontFamily: 'Arial',
     *     },
     *     resolution: 2 // Resolution is set here
     * });
     *
     * const text = new BitmapText({
     *     text: 'Hello',
     *     style: {
     *         fontFamily: 'MyFont' // Uses font's resolution
     *     }
     * });
     * ```
     * @default 1
     * @see {@link BitmapFont.install} For setting font resolution
     * @throws {Warning} When attempting to change resolution directly
     * @readonly
     */
    override set resolution(value: number)
    {
        // #if _DEBUG
        if (value !== null)
        {
            warn(
            // eslint-disable-next-line max-len
                '[BitmapText] dynamically updating the resolution is not supported. Resolution should be managed by the BitmapFont.'
            );
        }
        // #endif
    }

    override get resolution(): number
    {
        return this._resolution;
    }
}
