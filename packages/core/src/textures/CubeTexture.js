import BaseTexture from './BaseTexture';
import CubeResource from './resources/CubeResource';

export default class CubeTexture extends BaseTexture
{
    static from(...urls)
    {
        return new CubeTexture(CubeResource.from(urls));
    }
}
