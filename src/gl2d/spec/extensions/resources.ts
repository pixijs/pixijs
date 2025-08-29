import {
    type GL2DCanvasGradient,
    type GL2DCanvasPattern,
    type GL2DImageSource,
    type GL2DSpritesheet,
    type GL2DStroke,
    type GL2DTextStyle,
    type GL2DTexture,
    type GL2DTextureSource,
    type GL2DVideoSource,
} from '../resources';

import type {
    ALPHA_MODES,
    COMPARE_FUNCTION,
    TEXTURE_DIMENSIONS,
} from '../../../rendering/renderers/shared/texture/const';
import type { TextStyleWhiteSpace } from '../../../scene/text/TextStyle';

/**
 * Represents a PixiJS textureResource node within a GL2D file through an extension.
 *
 * TextureResource nodes are used to define and manage textures within the GL2D framework.
 * @category gl2d
 * @standard
 */
export type PixiGL2DTexture = GL2DTexture<PixiGL2DTextureExtension>;

/**
 * Extension properties for PixiJS textureResource nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DTextureExtension
{
    /** Unique identifier for the PixiJS textureResource node */
    pixi_texture_resource: {
        /** The area of original texture */
        orig: [number, number, number, number];
        /** Trimmed rectangle of original texture */
        trim: [number, number, number, number];
        /** Default anchor point used for sprite placement / rotation */
        defaultAnchor: [number, number];
        /** Default borders used for 9-slice scaling {@link NineSlicePlane}*/
        defaultBorders: [number, number, number, number];
        /** indicates how the texture was rotated by texture packer. See {@link groupD8} */
        rotate: number;
        /**
         * Set to true if you plan on modifying this texture's frame, UVs, or swapping its source at runtime.
         * This is false by default as it improves performance. Generally, it's recommended to create new
         * textures and swap those rather than modifying an existing texture's properties unless you are
         * working with a dynamic frames.
         * Not setting this to true when modifying the texture can lead to visual artifacts.
         *
         * If this is false and you modify the texture, you can manually update the sprite's texture by calling
         * `sprite.onViewUpdate()`.
         */
        dynamic: boolean;
    };
}

/**
 * Represents a PixiJS texture source within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DTextureSource<T extends string> = GL2DTextureSource<T, PixiGL2DTextureSourceExtension>;

/**
 * Extension properties for PixiJS textureSource nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DTextureSourceExtension
{
    /** Unique identifier for the PixiJS textureResource node */
    pixi_texture_source_resource: {
        /** how many dimensions does this texture have? currently v8 only supports 2d */
        dimensions: TEXTURE_DIMENSIONS;
        /** The number of mip levels to generate for this texture. this is  overridden if autoGenerateMipmaps is true */
        mipLevelCount: number;
        /** Whether to automatically generate mipmaps for this texture. */
        autoGenerateMipmaps: boolean;
        /** If true, the Garbage Collector will unload this texture if it is not used after a period of time */
        autoGarbageCollect: boolean;

        /** When provided the sampler will be a comparison sampler with the specified {@link COMPARE_FUNCTION}. */
        compare: COMPARE_FUNCTION;
        /** Specifies the maximum anisotropy value clamp used by the sampler. */
        maxAnisotropy: number;
    };
}
/**
 * Represents a PixiJS image source within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DImageSource = GL2DImageSource<PixiGL2DImageSourceExtension>;

/**
 * Extension properties for PixiJS imageSource nodes.
 * @category gl2d
 * @standard
 */
export type PixiGL2DImageSourceExtension = PixiGL2DTextureSourceExtension;

/**
 * Represents a PixiJS video source within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DVideoSource = GL2DVideoSource<PixiGL2DVideoSourceExtension>;

/**
 * Extension properties for PixiJS videoSource nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DVideoSourceExtension extends PixiGL2DTextureSourceExtension
{
    pixi_video_source_resource: {
        /** The number of times a second to update the texture from the video. Leave at 0 to update at every render. */
        updateFPS: number;
        /** If true, the video will be preloaded. */
        preload: boolean;
        /** The time in milliseconds to wait for the video to preload before timing out. */
        preloadTimeoutMs: number;
        /** The alpha mode of the video. */
        alphaMode: ALPHA_MODES;
    };
}

/**
 * Represents a PixiJS sprite sheet within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DSpritesheet = GL2DSpritesheet<PixiGL2DSpritesheetExtension>;

/**
 * Extension properties for PixiJS spriteSheet nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DSpritesheetExtension
{
    pixi_spritesheet_resource: {
        /** The cache prefix for the spritesheet */
        cachePrefix: string;
    };
}

/**
 * Represents a PixiJS stroke style within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DStroke = GL2DStroke<PixiGL2DStrokeExtension>;

/**
 * Extension properties for PixiJS stroke styles.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DStrokeExtension
{
    pixi_stroke: {
        /** Whether the stroke is a pixel line, only used by Graphics */
        pixelLine?: boolean;
    };
}

/** Helper type to extract specific extension properties from an extension interface */
type Picker<T, K extends keyof T> = Pick<T, K>;

/**
 * Represents a PixiJS text style within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DTextStyle = GL2DTextStyle<
    {
        extensions: Picker<PixiGL2DTextStyleExtension, 'pixi_text_style_resource'>,
        wordWrap: Picker<PixiGL2DTextStyleExtension, 'pixi_wrap_mode'>,
        stroke: Picker<PixiGL2DStrokeExtension, 'pixi_stroke'>,
    }
>;

/**
 * Extension properties for PixiJS text styles.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DTextStyleExtension
{
    pixi_text_style_resource: {
        /** An array of filter names to apply to the text. */
        filters?: string[];
        /** Whether to automatically trim transparent pixels from the rendered text texture. */
        trim?: boolean;
        /**
         * Additional spacing between lines of text, in pixels.
         * This is added to the natural line height calculated from the font.
         */
        leading?: number;
        /**
         * Explicit line height in pixels.
         * If not specified, line height is calculated automatically from the font.
         * Setting this provides precise control over vertical text spacing.
         */
        lineHeight?: number;
    };
    pixi_wrap_mode: {
        /**
         * Whether to allow line breaks within individual words.
         *
         * **Behavior:**
         * - `false`: Break only at word boundaries (spaces, hyphens)
         * - `true`: Break anywhere within a word if necessary
         *
         * Useful for handling very long words or narrow text areas.
         */
        breakWords?: boolean;
        /**
         * CSS-style white space handling strategy.
         *
         * **Options:**
         * - `"normal"`: Collapse whitespace, wrap as needed
         * - `"nowrap"`: Collapse whitespace, no wrapping
         * - `"pre"`: Preserve whitespace, no wrapping
         * - `"pre-wrap"`: Preserve whitespace, wrap as needed
         * - `"pre-line"`: Collapse spaces, preserve line breaks, wrap as needed
         */
        whiteSpace?: TextStyleWhiteSpace;
    };
}

/**
 * Represents a PixiJS fill gradient within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DCanvasGradient = GL2DCanvasGradient<PixiGL2DCanvasGradientExtension>;

/**
 * Extension properties for PixiJS fill gradients.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DCanvasGradientExtension
{
    pixi_canvas_gradient: {
        /** The size of the texture to use for the gradient */
        textureSize?: number;
        /** The wrap mode of the gradient. */
        wrapMode?: 'clamp-to-edge' | 'repeat';
        /**
         * The y scale of the gradient, use this to make the gradient elliptical.
         * NOTE: Only applied to radial gradients used with Graphics.
         */
        scale?: number;
        /**
         * The rotation of the gradient in radians, useful for making the gradient elliptical.
         * NOTE: Only applied to radial gradients used with Graphics.
         */
        rotation?: number;
    };
}

/**
 * Represents a PixiJS fill patterns within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DCanvasPattern = GL2DCanvasPattern;
