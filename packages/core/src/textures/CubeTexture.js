import BaseTexture from './BaseTexture';
import CubeResource from './resources/CubeResource';

/**
 * Texture that depends on six other resources.
 *
 * @class
 * @extends PIXI.BaseTexture
 * @memberof PIXI
 */
export default class CubeTexture extends BaseTexture
{
    static from(...urls)
    {
        return new CubeTexture(CubeResource.from(urls));
    }
}
