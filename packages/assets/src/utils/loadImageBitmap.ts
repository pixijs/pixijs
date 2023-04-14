import { settings } from '@pixi/core';

let canLoadImageBitmapPromise: Promise<boolean> | undefined;

/** Returns true if and only if `loadImageBitmap` is supported. */
export function canLoadImageBitmap(): Promise<boolean>
{
    canLoadImageBitmapPromise ??= (async () =>
    {
        try
        {
            // eslint-disable-next-line max-len
            const imageBitmap = await loadImageBitmap('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=');
            const valid = imageBitmap.width === 1 && imageBitmap.height === 1;

            imageBitmap.close();

            return valid;
        }
        catch (e)
        {
            return false;
        }
    })();

    return canLoadImageBitmapPromise;
}

/**
 * Returns a promise that resolves an ImageBitmaps.
 * This function is designed to be used by a worker.
 * Part of WorkerManager!
 * @param url - The image to load an image bitmap for
 */
export async function loadImageBitmap(url: string): Promise<ImageBitmap>
{
    const response = await settings.ADAPTER.fetch(url);

    if (!response.ok)
    {
        throw new Error(`[loadImageBitmap] Failed to fetch ${url}: `
            + `${response.status} ${response.statusText}`);
    }

    const imageBlob = await response.blob();
    const imageBitmap = await createImageBitmap(imageBlob);

    return imageBitmap;
}
