const inWorker = 'WorkerGlobalScope' in globalThis
    && globalThis instanceof (globalThis as any).WorkerGlobalScope;

export async function testVideoFormat(dataURL: string): Promise<boolean>
{
    if (!dataURL.startsWith('data:video/'))
    {
        throw new Error('Invalid video data URL');
    }

    if (inWorker)
    {
        return false;
    }

    return new Promise((resolve) =>
    {
        const video = document.createElement('video');

        video.autoplay = false;
        video.crossOrigin = 'anonymous';
        video.preload = 'auto';
        video.oncanplay = () => resolve(true);
        video.onerror = () => resolve(false);
        video.src = dataURL;
        video.load();
    });
}
