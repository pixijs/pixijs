import { LoaderResource } from '@pixi/loaders';
import type { ILoaderPlugin } from '@pixi/loaders';
import { AnimatedGIF } from './AnimatedGIF';

/** Default extension for GIF images */
const GIF_EXTENSION = 'gif';

// Satsify the LoaderResource interface
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace GlobalMixins {
        interface LoaderResource {
            animation?: AnimatedGIF;
        }
    }
}

/**
 * Handle the loading of GIF images.
 * @memberof PIXI.gif
 * @class AnimatedGIFLoader
 * @example
 * import { Loader } from '@pixi/loaders';
 * import { GIFLoader } from '@pixi/gif';
 * Loader.registerPlugin(GIFLoader);
 */
const AnimatedGIFLoader: ILoaderPlugin = {
    /** For loading methods */
    add()
    {
        LoaderResource.setExtensionXhrType(
            GIF_EXTENSION,
            LoaderResource.XHR_RESPONSE_TYPE.BUFFER
        );
        LoaderResource.setExtensionLoadType(
            GIF_EXTENSION,
            LoaderResource.LOAD_TYPE.XHR
        );
    },
    /** Implement loader */
    use(resource: LoaderResource, next: (...args: any[]) => void): void
    {
        if (resource.extension === GIF_EXTENSION)
        {
            resource.animation = AnimatedGIF.fromBuffer(resource.data);
        }
        next();
    }
};

export { AnimatedGIFLoader };
