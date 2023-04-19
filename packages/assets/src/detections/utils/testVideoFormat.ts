const inWorker = 'WorkerGlobalScope' in globalThis
    && globalThis instanceof (globalThis as any).WorkerGlobalScope;

export function testVideoFormat(mimeType: string): boolean
{
    if (inWorker)
    {
        return false;
    }

    const video = document.createElement('video');

    return video.canPlayType(mimeType) !== '';
}
