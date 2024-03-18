import KTXWorker from 'worker:./ktx.worker.ts';
import { ktxTranscoderUrls } from '../utils/setKTXTranscoderPath';

import type { TEXTURE_FORMATS } from '../../../rendering/renderers/shared/texture/const';
import type { TextureSourceOptions } from '../../../rendering/renderers/shared/texture/sources/TextureSource';

let ktxWorker: Worker;
const urlHash: Record<string, (value: any) => void> = {};

function getKTX2Worker(supportedTextures: TEXTURE_FORMATS[]): Worker
{
    if (!ktxWorker)
    {
        ktxWorker = new KTXWorker().worker;

        ktxWorker.onmessage = (messageEvent) =>
        {
            const { success, url, textureOptions } = messageEvent.data;

            if (!success)
            {
                console.warn('Failed to load KTX texture', url);
            }

            urlHash[url](textureOptions);
        };

        ktxWorker.postMessage({
            type: 'init',
            jsUrl: ktxTranscoderUrls.jsUrl,
            wasmUrl: ktxTranscoderUrls.wasmUrl,
            supportedTextures
        });
    }

    return ktxWorker;
}

export function loadKTX2onWorker(
    url: string,
    supportedTextures: TEXTURE_FORMATS[]
): Promise<TextureSourceOptions>
{
    const ktxWorker = getKTX2Worker(supportedTextures);

    return new Promise((resolve) =>
    {
        urlHash[url] = resolve;

        ktxWorker.postMessage({ type: 'load', url });
    });
}
