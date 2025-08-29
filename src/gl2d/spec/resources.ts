import {
    type ALPHA_MODES,
    type SCALE_MODE,
    type TEXTURE_FORMATS,
    type WRAP_MODE,
} from '../../rendering/renderers/shared/texture/const';
import { type PatternRepetition } from '../../scene/graphics/shared/fill/FillPattern';
import {
    type TextStyleAlign,
    type TextStyleFontStyle,
    type TextStyleFontVariant,
    type TextStyleFontWeight,
    type TextStyleTextBaseline,
} from '../../scene/text/TextStyle';
import { type GL2DExtension } from './file';

/**
 * Represents a GL2D resource within a GL2D file.
 *
 * Resources are reusable assets such as textures, audio files, fonts,
 * and other media that can be referenced by nodes in the scene graph.
 * @example
 * ```typescript
 * const textureResource: GL2DResource = {
 *   type: "texture",
 *   uri: "/assets/player.png",
 *   width: 64,
 *   height: 64
 * };
 * ```
 * @category gl2d
 * @standard
 */
export interface GL2DResource<T extends string = string, K extends Record<string, any> = Record<string, any>>
    extends GL2DExtension<K>
{
    /**
     * Discriminator indicating the kind of resource (e.g., "texture", "font", "audio", "gradient").
     * This value is used to determine how the resource should be interpreted and loaded.
     */
    type: T;
    /** Unique identifier for the resource. */
    uid?: string;
    /** Human‑readable name for the resource. Useful as an identifier when referencing or debugging. */
    name?: string;
    /**
     * Location of the resource data.
     * Can be an absolute URL, a relative path, or a data URI (e.g., `data:image/png;base64,...`).
     */
    uri?: string;
}

/**
 * Represents a texture resource in a GL2D file.
 * @category gl2d
 * @standard
 */
export interface GL2DTexture<K extends Record<string, any> = Record<string, any>> extends GL2DResource<'texture', K>
{
    /** The location of the source resource in the gl2D resources array */
    source: number;
    /** The rectangle frame of the texture to show */
    frame?: [number, number, number, number];
}

/**
 * A generic texture source in a GL2D file.
 * @category gl2d
 * @standard
 */
export interface GL2DTextureSource<T extends string = string, K extends Record<string, any> = Record<string, any>>
    extends GL2DResource<T, K>
{
    /** the pixel width of this texture source. This is the REAL pure number, not accounting resolution */
    width?: number;
    /** the pixel height of this texture source. This is the REAL pure number, not accounting resolution */
    height?: number;
    /** the resolution of the texture. */
    resolution?: number;
    /** the format that the texture data has */
    format?: TEXTURE_FORMATS;
    /**
     * Only really affects RenderTextures.
     * Should we use antialiasing for this texture. It will look better, but may impact performance as a
     * Blit operation will be required to resolve the texture.
     */
    antialias?: boolean;

    /** the alpha mode of the texture */
    alphaMode?: ALPHA_MODES;

    /** setting this will set wrapModeU,wrapModeV and wrapModeW all at once! */
    addressMode?: WRAP_MODE;
    /** specifies the {{GPUAddressMode|address modes}} for the texture width, height, and depth coordinates, respectively. */
    addressModeU?: WRAP_MODE;
    /** specifies the {{GPUAddressMode|address modes}} for the texture width, height, and depth coordinates, respectively. */
    addressModeV?: WRAP_MODE;
    /** Specifies the {{GPUAddressMode|address modes}} for the texture width, height, and depth coordinates, respectively. */
    addressModeW?: WRAP_MODE;

    /** setting this will set magFilter,minFilter and mipmapFilter all at once!  */
    scaleMode?: SCALE_MODE;

    /** specifies the sampling behavior when the sample footprint is smaller than or equal to one texel. */
    magFilter?: SCALE_MODE;
    /** specifies the sampling behavior when the sample footprint is larger than one texel. */
    minFilter?: SCALE_MODE;
    /** specifies behavior for sampling between mipmap levels. */
    mipmapFilter?: SCALE_MODE;

    /** specifies the minimum and maximum levels of detail, respectively, used internally when sampling a texture. */
    lodMinClamp?: number;
    /** Specifies the minimum and maximum levels of detail, respectively, used internally when sampling a texture. */
    lodMaxClamp?: number;
}

/**
 * Represents an image source resource in a GL2D file such as a bitmap or a video.
 * @category gl2d
 * @standard
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GL2DImageSource<K extends Record<string, any> = Record<string, any>>
    extends GL2DTextureSource<'image_source', K> {}

/**
 * Represents an video source resource in a GL2D file such as a bitmap or a video.
 * @category gl2d
 * @standard
 */
export interface GL2DVideoSource<K extends Record<string, any> = Record<string, any>>
    extends GL2DTextureSource<'video_source', K>
{
    /** If true, the video will start loading immediately. */
    autoLoad?: boolean;
    /** If true, the video will start playing as soon as it is loaded. */
    autoPlay?: boolean;
    /** If true, the video will be loaded with the `crossorigin` attribute. */
    crossorigin?: boolean | string;
    /** If true, the video will loop when it ends. */
    loop?: boolean;
    /** If true, the video will be muted. */
    muted?: boolean;
    /** If true, the video will play inline. */
    playsinline?: boolean;
}

/**
 * Represents a spritesheet resource in a GL2D file.
 * @category gl2d
 * @standard
 */
export interface GL2DSpritesheet<K extends Record<string, any> = Record<string, any>>
    extends GL2DResource<'spritesheet', K>
{
    /** The location of the texture source in the gl2D resources array */
    source: number;
}

/**
 * Represents a text style resource in a GL2D file.
 *
 * Text style resources define reusable styling configurations for text rendering,
 * including typography, colors, effects, and layout properties. This promotes
 * consistency across the application and enables easy theme management.
 * @category gl2d
 * @standard
 */
export interface GL2DTextStyle<
    K extends {
        extensions?: Record<string, any>;
        wordWrap?: Record<string, any>;
        stroke?: Record<string, any>;
        shadow?: Record<string, any>;
    },
> extends GL2DResource<'text_style', K['extensions']>
{
    /**
     * Horizontal text alignment within the text bounds.
     *
     * **Options:**
     * - `"left"`: Align text to the left edge
     * - `"center"`: Center text horizontally
     * - `"right"`: Align text to the right edge
     * - `"justify"`: Distribute text to fill the full width
     */
    align?: TextStyleAlign;
    /** Drop shadow configuration for the text. */
    shadow?: GL2DShadow<K['shadow']>;
    /** Fill style for the text characters. Can be a color string, or an indices to the gradient/pattern. */
    fill?: string | number;
    /** Font family name. Can reference system fonts, web fonts, or custom loaded fonts. */
    fontFamily: string | string[];
    /** Font size in pixels. */
    fontSize?: number;
    /**
     * Font style variant.
     *
     * **Options:**
     * - `"normal"`: Standard upright text
     * - `"italic"`: Slanted italic text
     * - `"oblique"`: Artificially slanted text (when true italic unavailable)
     */
    fontStyle?: TextStyleFontStyle;
    /**
     * Font variant for typography features.
     *
     * **Options:**
     * - `"normal"`: Standard character rendering
     * - `"small-caps"`: Use small capital letters for lowercase characters
     */
    fontVariant?: TextStyleFontVariant;
    /**
     * Font weight controlling text thickness.
     *
     * **Options:**
     * - Numeric: `100` (thin) to `900` (black)
     * - Named: `"normal"` (400), `"bold"` (700), etc.
     * - Relative: `"lighter"`, `"bolder"`
     */
    fontWeight?: TextStyleFontWeight;
    /**
     * Additional spacing between characters, in pixels.
     * Positive values increase spacing, negative values decrease it.
     * This is added to the font's natural character spacing.
     */
    letterSpacing?: number;
    /**
     * Padding around the text content in pixels.
     * Format: [top, right, bottom, left] (CSS-style clockwise from top).
     *
     * **Purpose:**
     * - Provides space for text effects (shadows, glows, outlines)
     * - Prevents clipping of italic or decorative fonts
     * - Creates consistent spacing in UI layouts
     */
    padding?: [number, number, number, number];
    /**
     * Stroke (outline) style for text characters.
     * Creates an outline around each character, useful for readability over varied backgrounds.
     *
     * Can be a color string, or an indices to the gradient/pattern.
     */
    stroke?: GL2DStroke<K['stroke']>;
    /**
     * Vertical alignment baseline for text positioning.
     * Determines which part of the text aligns to the y-coordinate.
     *
     * **Options:**
     * - `"alphabetic"`: Baseline of alphabetic characters (default)
     * - `"top"`: Top of the em square
     * - `"hanging"`: Hanging baseline (for some scripts)
     * - `"middle"`: Middle of the em square
     * - `"ideographic"`: Ideographic baseline (for CJK scripts)
     * - `"bottom"`: Bottom of the em square
     */
    textBaseline?: TextStyleTextBaseline;
    /** Word wrapping configuration for multi-line text. Controls how text flows when it exceeds the specified width. */
    wordWrap?: GL2DWordWrap<K['wordWrap']>;
}

/**
 * Word wrapping configuration for multi-line text.
 * Controls how text flows when it exceeds the specified width.
 * @category gl2d
 * @standard
 */
export interface GL2DWordWrap<K extends Record<string, any> = Record<string, any>> extends GL2DExtension<K>
{
    /**
     * Whether to enable word wrapping for the text.
     *
     * **Behavior:**
     * - `false`: No wrapping, text will overflow the container
     * - `true`: Text will wrap to the next line when it exceeds the container width
     */
    enabled: boolean;
    /**
     * The maximum width at which text will wrap to the next line, in pixels.
     * Text exceeding this width will be broken according to the wrap settings.
     */
    width?: number;
}

/**
 * Shadow configuration for text.
 * @category gl2d
 * @standard
 */
export interface GL2DShadow<K extends Record<string, any> = Record<string, any>> extends GL2DExtension<K>
{
    /** The opacity of the shadow (0.0 = transparent, 1.0 = opaque). */
    alpha?: number;
    /** The blur radius for the shadow effect, in pixels. Higher values create softer shadows. */
    blur?: number;
    /** The shadow color as a CSS color string (hex, rgb, rgba, named colors). */
    color?: string;
    /** Horizontal offset of the shadow from the text, in pixels. Positive = right, negative = left. */
    offsetX?: number;
    /** Vertical offset of the shadow from the text, in pixels. Positive = down, negative = up. */
    offsetY?: number;
}

/**
 * Stroke configuration for text and graphics
 * @category gl2d
 * @standard
 */
export interface GL2DStroke<K extends Record<string, any> = Record<string, any>> extends GL2DExtension<K>
{
    fill: string | number;
    /** The width of the stroke in pixels. */
    width?: number;
    /** The alignment of the stroke relative to the path. */
    alignment?: number;
    /**
     * The style to use for the ends of open paths.
     * - 'butt': Ends at path end
     * - 'round': Rounds past path end
     * - 'square': Squares past path end
     */
    cap?: CanvasLineCap;
    /**
     * The style to use where paths connect.
     *
     * **Options:**
     * - 'miter': Sharp corner
     * - 'round': Rounded corner
     * - 'bevel': Beveled corner
     */
    join?: CanvasLineJoin;
    /** Controls how far miter joins can extend. */
    miterLimit?: number;
}

/**
 * Represents a canvas gradient resource for text styles and graphics.
 * @category gl2d
 * @standard
 */
export interface GL2DCanvasGradient<K extends Record<string, any> = Record<string, any>>
    extends GL2DResource<'canvas_gradient', K>
{
    /**
     * The type of gradient geometry.
     *
     * **Options:**
     * - `"linear"`: Straight-line gradient between two points
     * - `"radial"`: Circular gradient radiating from a center point
     *
     * This determines which geometry properties (linear vs radial) are used
     * and affects the rendering algorithm and performance characteristics.
     */
    gradientType: 'linear' | 'radial';
    /**
     * Coordinate system for gradient positioning.
     *
     * **Options:**
     * - `"local"`: Coordinates relative to the filled object (0-1 range, default)
     * - `"global"`: Absolute coordinates in scene/world space
     */
    gradientUnits: 'local' | 'global';
    /**
     * Linear gradient configuration.
     * Defines the start and end points of a straight-line color transition.
     * Only used when `gradientType` is `"linear"`.
     *
     * **Coordinate Format:** [x, y]
     * - For local units: values typically 0-1 (can extend beyond for effects)
     * - For global units: actual pixel/world coordinates
     */
    linear?: {
        /** Starting point of the gradient line as [x, y] coordinates */
        start: [number, number];
        /** Ending point of the gradient line as [x, y] coordinates */
        end: [number, number];
    } & GL2DExtension;
    /**
     * Radial gradient configuration.
     * Defines two circles that control the radial color transition.
     * Only used when `gradientType` is `"radial"`.
     *
     * **Circle Format:** [centerX, centerY, radius]
     * - Center coordinates follow the gradientUnits setting
     * - Radius is always relative to the object size in local units
     */
    radial?: {
        /**
         * The outer circle defining the gradient's maximum extent.
         * Colors transition from inner circle to this boundary.
         * Format: [centerX, centerY, radius]
         */
        outerCircle: [number, number, number];

        /**
         * The inner circle defining the gradient's starting point and focal area.
         * This is where the first color stop begins.
         * Format: [centerX, centerY, radius]
         */
        innerCircle: [number, number, number];
    } & GL2DExtension;
    /**
     * Color stops defining the gradient's color progression.
     * Each stop specifies a position along the gradient and the color at that position.
     *
     * **Color Stop Properties:**
     * - `offset`: Position along gradient (0.0 = start, 1.0 = end)
     * - `color`: CSS color string (hex, rgb, rgba, hsl, named colors)
     */
    stops: Array<[number, string]>;
}

/**
 * Represents a canvas pattern resource for text styles and graphics.
 * @category gl2d
 * @standard
 */
export interface GL2DCanvasPattern<K extends Record<string, any> = Record<string, any>>
    extends GL2DResource<'canvas_pattern', K>
{
    /** The indices of the texture  */
    source: number;
    /** The repetition behavior of the pattern. */
    repeat?: PatternRepetition;
    /**
     * The transform matrix applied to the pattern.
     * Represented as a 3x3 matrix in a flat array:
     * [a, c, tx,
     *  b, d, ty,
     *  0, 0, 1]
     */
    transform?: [number, number, number, number, number, number];
}

/**
 * Represents a web font resource for text.
 * @category gl2d
 * @standard
 */
export interface GL2DWebFont<K extends Record<string, any> = Record<string, any>>
    extends GL2DResource<'web_font', K>
{
    /** Font family name */
    family: string;
    /** A set of optional descriptors passed as an object. It can contain any of the descriptors available for @font-face: */
    display?: string;
    /**
     * The featureSettings property of the FontFace interface retrieves or sets infrequently used
     * font features that are not available from a font's variant properties.
     */
    featureSettings?: string;
    /** The stretch property of the FontFace interface retrieves or sets how the font stretches. */
    stretch?: string;
    /** The style property of the FontFace interface retrieves or sets the font's style. */
    style?: string;
    /**
     * The unicodeRange property of the FontFace interface retrieves or sets the range of
     * unicode code points encompassing the font.
     */
    unicodeRange?: string;
    /** The variant property of the FontFace interface programmatically retrieves or sets font variant values. */
    variant?: string;
    /** The weight property of the FontFace interface retrieves or sets the weight of the font. */
    weights?: string[];
}

/**
 * Represents a bitmap font resource for text.
 * @category gl2d
 * @standard
 */
export interface GL2DBitmapFont<K extends Record<string, any> = Record<string, any>>
    extends GL2DResource<'bitmap_font', K>
{
    /** Font family name */
    fontFamily: string;
}
