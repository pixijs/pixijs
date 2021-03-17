import { Resource } from 'resource-loader';

import type { IBaseTextureOptions, Texture } from '@pixi/core';

/**
 * Resource metadata, can be used to pass BaseTexture options.
 * @memberof PIXI
 * @extends PIXI.IBaseTextureOptions
 */
export interface IResourceMetadata extends GlobalMixins.IResourceMetadata, Resource.IMetadata, IBaseTextureOptions {
    /**
     * Used by BitmapFonts, Spritesheet and CompressedTextures as the options to used for
     * metadata when loading the child image.
     * @type {PIXI.IResourceMetadata}
     */
    imageMetadata?: IResourceMetadata;
}

/**
 * PixiJS' base Loader resource type. This is a superset of the resource-loader's Resource class
 * and contains any mixins for extending.
 * @memberof PIXI
 * @extends resource-loader.Resource
 */
export interface ILoaderResource extends GlobalMixins.ILoaderResource, Resource
{
    /**
     * Texture reference for loading images and other textures.
     * @type {PIXI.Texture}
     */
    texture?: Texture;

    /**
     * Data that can be added for loading resources.
     * @type {PIXI.IResourceMetadata}
     */
    metadata: IResourceMetadata;
}

// Mix constructor and typeof Resource , otherwise we can't access to statics field
export type TLoaderResource = { new(...args: any[]): ILoaderResource } & typeof Resource;

/**
* Reference to **{@link https://github.com/englercj/resource-loader}**'s Resource class.
* @see https://englercj.github.io/resource-loader/classes/resource.html
* @class LoaderResource
* @memberof PIXI
*/
export const LoaderResource: TLoaderResource = Resource;
