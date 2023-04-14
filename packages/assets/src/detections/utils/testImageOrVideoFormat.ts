import { canLoadImageBitmap, loadImageBitmap } from '../../utils/loadImageBitmap';

const inWorker = 'WorkerGlobalScope' in globalThis
    && globalThis instanceof (globalThis as any).WorkerGlobalScope;

export async function testImageOrVideoFormat(dataURL: string): Promise<boolean>
{
    if (!dataURL.startsWith('data:'))
    {
        throw new Error('Invalid data URL');
    }

    const useLoadImageBitmap = await canLoadImageBitmap();

    if (useLoadImageBitmap || inWorker)
    {
        if (!useLoadImageBitmap)
        {
            throw new Error('loadImageBitmap is not supported in worker');
        }

        try
        {
            const imageBitmap = await loadImageBitmap(dataURL);
            const valid = imageBitmap.width > 0 && imageBitmap.height > 0;

            imageBitmap.close();

            return valid;
        }
        catch (e)
        {
            return false;
        }
    }

    if (dataURL.startsWith('data:image/'))
    {
        return new Promise((resolve) =>
        {
            const image = document.createElement('img');

            image.crossOrigin = 'anonymous';
            image.onload = () => resolve(true);
            image.onerror = () => resolve(false);
            image.src = dataURL;
        });
    }

    if (dataURL.startsWith('data:video/'))
    {
        return new Promise((resolve) =>
        {
            const video = document.createElement('video');

            video.autoplay = false;
            video.crossOrigin = 'anonymous';
            video.preload = 'auto';
            video.onload = () => resolve(true);
            video.onerror = () => resolve(false);
            video.src = dataURL;
            video.load();
        });
    }

    throw new Error('The data URL is neither an image or a video');
}
