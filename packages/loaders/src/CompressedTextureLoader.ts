import { Loader } from './Loader';
import { ILoaderResource, LoaderResource } from './LoaderResource';
import { INTERNAL_FORMATS } from '@pixi/constants';

/**
 * Schema for compressed-texture manifests
 *
 * @ignore
 * @see PIXI.CompressedTextureLoader
 */
export type CompressedTextureManifest = {
    [P in keyof (INTERNAL_FORMATS)]: string;
} & {
    textureID?: string;
    fallback: string;
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
        const data = resource.data;
        const loader = (this as any) as Loader;

        if (!CompressedTextureLoader.textureExtensions)
        {
            CompressedTextureLoader.autoDetectExtensions();
        }
        if (resource.type === LoaderResource.TYPE.JSON
            && data
            && data.textureID)
        {
            const manifest = resource.data as CompressedTextureManifest;
            const formats = Object.keys(manifest)
                .filter((key) => key !== 'textureID' && key !== 'fallback');

            let validFormat;

            // Search for an extension that holds one the formats
            for (const extensionName in CompressedTextureLoader.textureExtensions)
            {
                const extension = (CompressedTextureLoader.textureExtensions as any)[extensionName];

                if (!extension)
                {
                    continue;
                }

                for (let i = 0, j = formats.length; i < j; i++)
                {
                    const format = formats[i];

                    if (extension[format])
                    {
                        validFormat = format;
                        break;
                    }
                }
            }

            const url: string = validFormat ? (manifest as any)[validFormat] : manifest.fallback;

            // Make sure we have a URL
            if (!url)
            {
                throw new Error(`Cannot load compressed-textures in ${resource.url}, make sure you provide a fallback`);
            }
            else if (!manifest.fallback)
            {
                console.warn(`Compressed texture manifest without a fallback found (${resource.url})`);
            }

            if (url === resource.url)
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
            loader.add(manifest.textureID, url, loadOptions, function onCompressedTextureLoaded()
            {
                next();
            });
        }
        else
        {
            if (resource.url.toLowerCase().endsWith('.compressed-textures.json'))
            {
                // Give a warning if the URL suggests this should be a compressed-textures manifest
                console.warn(`${resource.url} is not a valid compressed-textures manifest. It is being skipped!`);
            }
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
                pvrtc: gl.getExtension('WEBGL_compressed_texture_pvrtc'),
                atc: gl.getExtension('WEBGL_compressed_texture_atc'),
                astc: gl.getExtension('WEBGL_compressed_texture_astc')
            };
        }

        CompressedTextureLoader.textureExtensions = extensions;
    }
}
