import {
    type Gl2DImageSource,
    type Gl2DSpritesheetSource,
    type Gl2DTexture,
    type Gl2DTextureSource,
    type Gl2DVideoSource,
} from '../resources';

import type { ALPHA_MODES, COMPARE_FUNCTION, TEXTURE_DIMENSIONS } from '../../rendering/renderers/shared/texture/const';

/**
 * Represents a PixiJS textureResource node within a GL2D file through an extension.
 *
 * TextureResource nodes are used to define and manage textures within the GL2D framework.
 * @category gl2d
 * @standard
 */
export type PixiGl2DTexture = Gl2DTexture<PixiGl2DTextureExtension>;

/**
 * Extension properties for PixiJS textureResource nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGl2DTextureExtension
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
export type PixiGl2DTextureSource<T extends string> = Gl2DTextureSource<T, PixiGl2DTextureSourceExtension>;

/**
 * Extension properties for PixiJS textureSource nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGl2DTextureSourceExtension
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
export type PixiGl2DImageSource = Gl2DImageSource<PixiGl2DImageSourceExtension>;

/**
 * Extension properties for PixiJS imageSource nodes.
 * @category gl2d
 * @standard
 */
export type PixiGl2DImageSourceExtension = PixiGl2DTextureSourceExtension;

/**
 * Represents a PixiJS video source within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGl2DVideoSource = Gl2DVideoSource<PixiGl2DVideoSourceExtension>;

/**
 * Extension properties for PixiJS videoSource nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGl2DVideoSourceExtension extends PixiGl2DTextureSourceExtension
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
export type PixiGl2DSpritesheetSource = Gl2DSpritesheetSource<PixiGl2DSpritesheetExtension>;

/**
 * Extension properties for PixiJS spriteSheet nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGl2DSpritesheetExtension
{
    pixi_spritesheet_resource: {
        /** The cache prefix for the spritesheet */
        cachePrefix: string;
    };
}
