import { LoaderResource } from '@pixi/loaders';

import type { Loader, ILoaderResource } from '@pixi/loaders';
import type { INTERNAL_FORMATS } from '../const';

/**
 * Schema for compressed-texture manifests
 *
 * @ignore
 * @see PIXI.CompressedTextureLoader
 */
export type CompressedTextureManifest = {
    textures: Array<{ src: string, format?: keyof INTERNAL_FORMATS}>,
    cacheID: string;
};

// Missing typings? - https://github.com/microsoft/TypeScript/issues/39655
/**
 * Compressed texture extensions
 */
/* eslint-disable camelcase */
export type CompressedTextureExtensions = {
    s3tc?: WEBGL_compressed_texture_s3tc,
    s3tc_sRGB: WEBGL_compressed_texture_s3tc_srgb,
    etc: any,
    etc1: any,
    pvrtc: any,
    atc: any,
    astc: WEBGL_compressed_texture_astc
};
export type CompressedTextureExtensionRef = keyof CompressedTextureExtensions;
/* eslint-enable camelcase */

/**
 * Loader plugin for handling compressed textures for all platforms.
 *
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
export class CompressedTextureLoader
{
    static textureExtensions: Partial<CompressedTextureExtensions>;
    static textureFormats: { [P in keyof INTERNAL_FORMATS]?: number };

    /**
     * Called after a compressed-textures manifest is loaded.
     *
     * This will then load the correct compression format for the device. Your manifest should adhere
     * to the following schema:
     *
     * ```js
     * import { INTERNAL_FORMATS } from '@pixi/constants';
     *
     * // The following should be present in a *.compressed-texture.json file!
     * const manifest = JSON.stringify({
     *   COMPRESSED_RGBA_S3TC_DXT5_EXT: "asset.s3tc.ktx",
     *   COMPRESSED_RGBA8_ETC2_EAC: "asset.etc.ktx",
     *   RGBA_PVRTC_4BPPV1_IMG: "asset.pvrtc.ktx",
     *   textureID: "asset.png",
     *   fallback: "asset.png"
     * });
     * ```
     *
     * @param resource
     * @param next
     */
    static use(resource: ILoaderResource, next: (...args: any[]) => void): void
    {
        const data: CompressedTextureManifest = resource.data;
        const loader = (this as any) as Loader;

        if (!CompressedTextureLoader.textureExtensions)
        {
            CompressedTextureLoader.autoDetectExtensions();
        }
        if (resource.type === LoaderResource.TYPE.JSON
            && data
            && data.cacheID
            && data.textures)
        {
            const textures = data.textures;

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
                throw new Error(`Cannot load compressed-textures in ${resource.url}, make sure you provide a fallback`);
            }
            if (textureURL === resource.url)
            {
                // Prevent infinite loops
                throw new Error('URL of compressed texture cannot be the same as the manifest\'s URL');
            }

            const loadOptions = {
                crossOrigin: resource.crossOrigin,
                metadata: resource.metadata.imageMetadata,
                parentResource: resource
            };

            // The appropriate loader should register the texture
            loader.add(data.cacheID, textureURL, loadOptions, function onCompressedTextureLoaded()
            {
                next();
            });
        }
        else
        {
            next();
        }
    }

    /**
     * Detects the available compressed texture extensions on the device.
     *
     * @param extensions - extensions provided by a WebGL context
     * @ignore
     */
    static autoDetectExtensions(extensions?: Partial<CompressedTextureExtensions>): void
    {
        // Auto-detect WebGL compressed-texture extensions
        if (!extensions)
        {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');

            if (!gl)
            {
                console.error('WebGL not available for compressed textures. Silently failing.');

                return;
            }

            extensions = {
                s3tc: gl.getExtension('WEBGL_compressed_texture_s3tc'),
                s3tc_sRGB: gl.getExtension('WEBGL_compressed_texture_s3tc_srgb'), /* eslint-disable-line camelcase */
                etc: gl.getExtension('WEBGL_compressed_texture_etc'),
                etc1: gl.getExtension('WEBGL_compressed_texture_etc1'),
                pvrtc: gl.getExtension('WEBGL_compressed_texture_pvrtc')
                    || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
                atc: gl.getExtension('WEBGL_compressed_texture_atc'),
                astc: gl.getExtension('WEBGL_compressed_texture_astc')
            };
        }

        CompressedTextureLoader.textureExtensions = extensions;
        CompressedTextureLoader.textureFormats = {};

        // Assign all available compressed-texture formats
        for (const extensionName in extensions)
        {
            const extension = extensions[extensionName as CompressedTextureExtensionRef];

            if (!extension)
            {
                continue;
            }

            Object.assign(
                CompressedTextureLoader.textureFormats,
                Object.getPrototypeOf(extension));
        }
    }
}
