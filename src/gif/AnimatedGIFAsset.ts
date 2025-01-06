import { DOMAdapter } from '../environment/adapter';
import { ExtensionType } from '../extensions/Extensions';
import { path } from '../utils/path';
import { type AnimatedGIFBufferOptions, AnimatedGIFSource } from './AnimatedGIFSource';

import type { AssetExtension } from '../assets/AssetExtension';

/**
 * Handle the loading of GIF images. Registering this loader plugin will
 * load all `.gif` images as an ArrayBuffer and transform into an
 * AnimatedGIFSource object.
 * @memberof gif
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

            return AnimatedGIFSource.fromBuffer(buffer, asset?.data);
        },
        unload: async (asset) =>
        {
            asset.destroy();
        },
    }
} as AssetExtension<AnimatedGIFSource, AnimatedGIFBufferOptions>;

export { AnimatedGIFAsset };
