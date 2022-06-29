import { LoaderResource } from '@pixi/loaders';
import { registerCompressedTextures } from './registerCompressedTextures';
import { ExtensionMetadata, ExtensionType } from '@pixi/core';
import { parseDDS } from '../parsers';

// Set DDS files to be loaded as an ArrayBuffer
LoaderResource.setExtensionXhrType('dds', LoaderResource.XHR_RESPONSE_TYPE.BUFFER);

/**
 * @class
 * @memberof PIXI
 * @implements {PIXI.ILoaderPlugin}
 * @see https://docs.microsoft.com/en-us/windows/win32/direct3ddds/dx-graphics-dds-pguide
 */
export class DDSLoader
{
    /** @ignore */
    static extension: ExtensionMetadata = ExtensionType.Loader;

    /**
     * Registers a DDS compressed texture
     * @see PIXI.Loader.loaderMiddleware
     * @param resource - loader resource that is checked to see if it is a DDS file
     * @param next - callback Function to call when done
     */
    public static use(resource: LoaderResource, next: (...args: any[]) => void): void
    {
        if (resource.extension === 'dds' && resource.data)
        {
            try
            {
                Object.assign(resource, registerCompressedTextures(
                    resource.name || resource.url,
                    parseDDS(resource.data),
                    resource.metadata,
                ));
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
