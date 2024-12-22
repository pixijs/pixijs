import { DOMAdapter } from '../environment/adapter';
import { ExtensionType } from '../extensions/Extensions';
import { path } from '../utils/path';
import { AnimatedGIF } from './AnimatedGIF';

import type { AssetExtension } from '../assets/AssetExtension';
import type { AnimatedGIFOptions } from './AnimatedGIF';

/**
 * Handle the loading of GIF images. Registering this loader plugin will
 * load all `.gif` images as an ArrayBuffer and transform into an
 * AnimatedGIF object.
 */
const AnimatedGIFAsset = {
    extension: ExtensionType.Asset,
    detection: {
        test: async () => true,
        add: async (formats) => [...formats, 'gif'],
        remove: async (formats) => formats.filter((format) => format !== 'gif'),
    },
    loader: {
        name: 'gifLoader',
        test: (url) => path.extname(url) === '.gif',
        load: async (url, asset) =>
        {
            const response = await DOMAdapter.get().fetch(url);
            const buffer = await response.arrayBuffer();

            return AnimatedGIF.fromBuffer(buffer, asset?.data);
        },
        unload: async (asset) =>
        {
            asset.destroy();
        },
    }
} as AssetExtension<AnimatedGIF, AnimatedGIFOptions>;

export { AnimatedGIFAsset };
