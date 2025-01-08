import { DOMAdapter } from '../environment/adapter';
import { ExtensionType } from '../extensions/Extensions';
import { path } from '../utils/path';
import { type GifBufferOptions, GifSource } from './GifSource';

import type { AssetExtension } from '../assets/AssetExtension';

/**
 * Handle the loading of GIF images. Registering this loader plugin will
 * load all `.gif` images as an ArrayBuffer and transform into an
 * GifSource object.
 * @memberof gif
 */
const GifAsset = {
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

            return GifSource.from(buffer, asset?.data);
        },
        unload: async (asset) =>
        {
            asset.destroy();
        },
    }
} as AssetExtension<GifSource, GifBufferOptions>;

export { GifAsset };
