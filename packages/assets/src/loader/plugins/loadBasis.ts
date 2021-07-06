import { BASIS_FORMATS, BasisLoader } from '@pixi/basis';
import { ALPHA_MODES,
    BaseTexture,
    BufferResource,
    CompressedTextureResource,
    MIPMAP_MODES,
    Resource,
    Texture } from 'pixi.js';
import { getExtension } from '../getExtension';

import { LoadPlugin } from './LoadPlugin';

type TranscodedResourcesArray = (Array<CompressedTextureResource> | Array<BufferResource>) & {
    basisFormat: BASIS_FORMATS
};

/**
 * Register basis texture
 */
const registerTexture = (url: string, resource: CompressedTextureResource | BufferResource): Texture<Resource> =>
{
    let texture: Texture<Resource>;

    try
    {
        const base = new BaseTexture(resource, {
            mipmap: MIPMAP_MODES.OFF,
            alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
        });

        texture = new Texture(base);

        BaseTexture.addToCache(base, url);
        Texture.addToCache(texture, url);
    }
    catch (e)
    {
        console.warn('Pixi.js Basis load fail,', e);
    }

    return texture;
};

/**
 * loads our basis textures!
 * Basis images require transcoding, which will use a worker where the device permits it
 */
const loadBasis = {
    test(url: string): boolean
    {
        return (getExtension(url) === '.basis');
    },
    async load(url: string)
    {
        // Assumes transcoder has been initialised,
        // to initialise - pass filepaths of transcoder through to resource plugin in the basis options

        const data = await (await fetch(url)).arrayBuffer();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const resources = await BasisLoader.transcodeAsync(data as ArrayBuffer) as TranscodedResourcesArray;

        return registerTexture(url, resources[0]);
    },
} as LoadPlugin;

export { loadBasis };
