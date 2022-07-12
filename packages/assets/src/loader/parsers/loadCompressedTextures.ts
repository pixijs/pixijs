import type { CompressedTextureManifest } from '@pixi/compressed-textures';
import { CompressedTextureLoader } from '@pixi/compressed-textures';
import { ExtensionType } from '@pixi/core';
import { Assets } from '../../Assets';
import { dirname } from '../../utils';
import type { Loader } from '../Loader';
import type { LoadAsset } from '../types';

import type { LoaderParser } from './LoaderParser';

/** A parser for handling compressed textures for all platforms */
export const loadCompressedTextures = {
    extension: ExtensionType.LoadParser,

    testParse(asset: CompressedTextureManifest): boolean
    {
        return typeof asset === 'object'
        && asset.cacheID
        && asset.textures
        && Array.isArray(asset.textures);
    },

    /**
     * This will then load the correct compression format for the device. Your manifest should adhere
     * to the following schema:
     *
     * ```js
     * import { INTERNAL_FORMATS } from '@pixi/constants';
     *
     * type CompressedTextureManifest = {
     *  textures: Array<{ src: string, format?: keyof INTERNAL_FORMATS}>,
     *  cacheID: string;
     * };
     * ```
     *
     * This is an example of a .json manifest file
     *
     * ```json
     * {
     *   "cacheID":"asset",
     *   "textures":[
     *     { "src":"asset.fallback.png" },
     *     { "format":"COMPRESSED_RGBA_S3TC_DXT5_EXT", "src":"asset.s3tc.ktx" },
     *     { "format":"COMPRESSED_RGBA8_ETC2_EAC", "src":"asset.etc.ktx" },
     *     { "format":"RGBA_PVRTC_4BPPV1_IMG", "src":"asset.pvrtc.ktx" }
     *   ]
     * }
     * ```
     * @param asset - The asset manifest
     * @param loadAsset - Data associated with the asset
     * @param loader - The loader instance
     */
    async parse(asset: CompressedTextureManifest, loadAsset: LoadAsset, loader: Loader): Promise<void>
    {
        const textures = asset.textures;

        let textureURL: string;
        let fallbackURL: string;

        // Search for an extension that holds one the formats
        for (let i = 0, j = textures.length; i < j; i++)
        {
            const texture = textures[i];
            const url = texture.src;
            const format = texture.format;

            if (!format)
            {
                fallbackURL = url;
            }
            if (CompressedTextureLoader.textureFormats[format])
            {
                textureURL = url;
                break;
            }
        }

        textureURL = textureURL || fallbackURL;

        // Make sure we have a URL
        if (!textureURL)
        {
            throw Error(`Cannot load compressed-textures in ${loadAsset.src}, make sure you provide a fallback`);
        }
        if (textureURL === loadAsset.src)
        {
            // Prevent infinite loops
            throw Error('URL of compressed texture cannot be the same as the manifest\'s URL');
        }

        let basePath = dirname(loadAsset.src);

        if (basePath && basePath.lastIndexOf('/') !== (basePath.length - 1))
        {
            basePath += '/';
        }

        Assets.resolver.add(asset.cacheID, basePath + textureURL);
        await loader.load(asset.cacheID);
    }
} as LoaderParser<CompressedTextureManifest>;

