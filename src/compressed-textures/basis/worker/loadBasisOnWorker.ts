import BasisWorker from 'worker:./basis.worker.ts';
import { basisTranscoderUrls } from '../utils/setBasisTranscoderPath';

import type { TEXTURE_FORMATS } from '../../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../../rendering/renderers/shared/texture/sources/TextureSource';

let basisWorker: Worker;
const urlHash: Record<string, (value: any) => void> = {};

function getBasisWorker(supportedTextures: TEXTURE_FORMATS[]): Worker
{
    if (!basisWorker)
    {
        basisWorker = new BasisWorker().worker;

        basisWorker.onmessage = (messageEvent) =>
        {
            const { success, url, textureOptions } = messageEvent.data;

            if (!success)
            {
                console.warn('Failed to load Basis texture', url);
            }

            urlHash[url](textureOptions);
        };

        basisWorker.postMessage({
            type: 'init',
            jsUrl: basisTranscoderUrls.jsUrl,
            wasmUrl: basisTranscoderUrls.wasmUrl,
            supportedTextures
        });
    }

    return basisWorker;
}

export function loadBasisOnWorker(
    url: string,
    supportedTextures: TEXTURE_FORMATS[]
): Promise<TextureSourceOptions>
{
    const ktxWorker = getBasisWorker(supportedTextures);

    return new Promise((resolve) =>
    {
        urlHash[url] = resolve;

        ktxWorker.postMessage({ type: 'load', url });
    });
}
