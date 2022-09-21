import { extensions, ExtensionType, settings, utils } from '@pixi/core';
import type { AssetExtension } from '@pixi/assets';
import { AnimatedGIF, AnimatedGIFOptions } from './AnimatedGIF';

/**
 * Handle the loading of GIF images. Registering this loader plugin will
 * load all `.gif` images as an ArrayBuffer and transform into an
 * AnimatedGIF object.
 * @ignore
 */
const AnimatedGIFAsset = {
    extension: ExtensionType.Asset,
    detection: {
        test: async () => true,
        add: async (formats) => [...formats, 'gif'],
        remove: async (formats) => formats.filter((format) => format !== 'gif'),
    },
    loader: {
        test: (url) => utils.path.extname(url) === '.gif',
        load: async (url, asset) =>
        {
            const response = await settings.ADAPTER.fetch(url);
            const buffer = await response.arrayBuffer();

            return AnimatedGIF.fromBuffer(buffer, asset?.data);
        },
        unload: async (asset) =>
        {
            asset.destroy();
        },
    }
} as AssetExtension<AnimatedGIF, AnimatedGIFOptions>;

extensions.add(AnimatedGIFAsset);

export { AnimatedGIFAsset };
