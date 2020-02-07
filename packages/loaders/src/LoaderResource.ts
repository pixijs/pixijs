import { Resource } from 'resource-loader';
import { Texture } from '@pixi/core';
import { Spritesheet } from '@pixi/spritesheet';

export interface IResourceMetadata extends Resource.IMetadata {
    imageMetadata?: any;
}
export interface ILoaderResource extends Resource
{
    texture?: Texture;
    spritesheet?: Spritesheet;

    // required for Spritesheet
    textures?: {[key: string]: Texture};

    // required specific type for Spritesheet
    metadata: IResourceMetadata;

    TYPE: typeof Resource.TYPE;
}

/**
* Reference to **{@link https://github.com/englercj/resource-loader
* resource-loader}**'s Resource class.
* @see http://englercj.github.io/resource-loader/Resource.html
* @class LoaderResource
* @memberof PIXI
*/
export const LoaderResource: ILoaderResource = Resource as any;
