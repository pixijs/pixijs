import {
    type ALPHA_MODES,
    type SCALE_MODE,
    type TEXTURE_FORMATS,
    type WRAP_MODE,
} from '../rendering/renderers/shared/texture/const';
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
export interface GL2DSpritesheetSource<K extends Record<string, any> = Record<string, any>>
    extends GL2DResource<'spritesheet', K>
{
    /** The location of the texture source in the gl2D resources array */
    source: number;
}
