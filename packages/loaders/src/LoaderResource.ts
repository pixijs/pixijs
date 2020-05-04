import { Resource } from 'resource-loader';

import type { Spritesheet } from '@pixi/spritesheet';
import type { Texture } from '@pixi/core';
import type { Dict } from '@pixi/utils';

export interface IResourceMetadata extends GlobalMixins.IResourceMetadata, Resource.IMetadata {
    imageMetadata?: any;
}
export interface ILoaderResource extends GlobalMixins.ILoaderResource, Resource
{
    texture?: Texture;
    spritesheet?: Spritesheet;

    // required for Spritesheet
    textures?: Dict<Texture>;

    // required specific type for Spritesheet
    metadata: IResourceMetadata;
}

// Mix constructor and typeof Resource , otherwise we can't access to statics field
type TLoaderResource = { new(...args: any[]): ILoaderResource } & typeof Resource;

/**
* Reference to **{@link https://github.com/englercj/resource-loader
* resource-loader}**'s Resource class.
* @see http://englercj.github.io/resource-loader/Resource.html
* @class LoaderResource
* @memberof PIXI
*/
export const LoaderResource: TLoaderResource = Resource;
