import { Resource } from 'resource-loader';
import { Texture } from '@pixi/core';
import { Spritesheet } from '@pixi/spritesheet';

/**
* Reference to **{@link https://github.com/englercj/resource-loader
* resource-loader}**'s Resource class.
* @see http://englercj.github.io/resource-loader/Resource.html
* @class LoaderResource
* @memberof PIXI
*/

export class LoaderResource extends Resource
{
    public texture?: Texture;
    public spritesheet?: Spritesheet;
}
