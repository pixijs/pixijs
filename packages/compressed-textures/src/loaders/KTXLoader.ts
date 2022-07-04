import { ALPHA_MODES, MIPMAP_MODES } from '@pixi/constants';
import type { ExtensionMetadata } from '@pixi/core';
import { BaseTexture, ExtensionType, Texture } from '@pixi/core';
import { LoaderResource } from '@pixi/loaders';
import { registerCompressedTextures } from './registerCompressedTextures';
import { parseKTX } from '../parsers';

// Set KTX files to be loaded as an ArrayBuffer
LoaderResource.setExtensionXhrType('ktx', LoaderResource.XHR_RESPONSE_TYPE.BUFFER);

/**
 * Loader plugin for handling KTX texture container files.
 *
 * This KTX loader does not currently support the following features:
 * * cube textures
 * * 3D textures
 * * endianness conversion for big-endian machines
 * * embedded *.basis files
 *
 * It does supports the following features:
 * * multiple textures per file
 * * mipmapping (only for compressed formats)
 * * vendor-specific key/value data parsing (enable {@link PIXI.KTXLoader.loadKeyValueData})
 * @class
 * @memberof PIXI
 * @implements {PIXI.ILoaderPlugin}
 */
export class KTXLoader
{
    /** @ignore */
    static extension: ExtensionMetadata = ExtensionType.Loader;

    /**
     * If set to `true`, {@link PIXI.KTXLoader} will parse key-value data in KTX textures. This feature relies
     * on the [Encoding Standard]{@link https://encoding.spec.whatwg.org}.
     *
     * The key-value data will be available on the base-textures as {@code PIXI.BaseTexture.ktxKeyValueData}. They
     * will hold a reference to the texture data buffer, so make sure to delete key-value data once you are done
     * using it.
     */
    static loadKeyValueData = false;

    /**
     * Called after a KTX file is loaded.
     *
     * This will parse the KTX file header and add a {@code BaseTexture} to the texture
     * cache.
     * @see PIXI.Loader.loaderMiddleware
     * @param resource - loader resource that is checked to see if it is a KTX file
     * @param next - callback Function to call when done
     */
    public static use(resource: LoaderResource, next: (...args: any[]) => void): void
    {
        if (resource.extension === 'ktx' && resource.data)
        {
            try
            {
                const url = resource.name || resource.url;
                const { compressed, uncompressed, kvData } = parseKTX(url, resource.data, this.loadKeyValueData);

                if (compressed)
                {
                    const result = registerCompressedTextures(
                        url,
                        compressed,
                        resource.metadata,
                    );

                    if (kvData && result.textures)
                    {
                        for (const textureId in result.textures)
                        {
                            result.textures[textureId].baseTexture.ktxKeyValueData = kvData;
                        }
                    }

                    Object.assign(resource, result);
                }
                else if (uncompressed)
                {
                    const textures: Record<string, Texture> = {};

                    uncompressed.forEach((image, i) =>
                    {
                        const texture = new Texture(new BaseTexture(
                            image.resource,
                            {
                                mipmap: MIPMAP_MODES.OFF,
                                alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
                                type: image.type,
                                format: image.format,
                            }
                        ));
                        const cacheID = `${url}-${i + 1}`;

                        if (kvData) texture.baseTexture.ktxKeyValueData = kvData;

                        BaseTexture.addToCache(texture.baseTexture, cacheID);
                        Texture.addToCache(texture, cacheID);

                        if (i === 0)
                        {
                            textures[url] = texture;
                            BaseTexture.addToCache(texture.baseTexture, url);
                            Texture.addToCache(texture, url);
                        }

                        textures[cacheID] = texture;
                    });

                    Object.assign(resource, { textures });
                }
            }
            catch (err)
            {
                next(err);

                return;
            }
        }

        next();
    }
}
