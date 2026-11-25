const SAFARI_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
    + '(KHTML, like Gecko) Version/18.0 Safari/605.1.15';

describe('glUploadVideoResource', () =>
{
    // fresh modules per test, so each import evaluates the uploader's module-level code
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should not read the navigator when the module is imported', async () =>
    {
        const { DOMAdapter } = await import('~/environment/adapter');
        const getNavigator = jest.spyOn(DOMAdapter.get(), 'getNavigator');

        try
        {
            await import('../uploaders/glUploadVideoResource');

            expect(getNavigator).not.toHaveBeenCalled();
        }
        finally
        {
            getNavigator.mockRestore();
        }
    });

    async function uploadVideoFrameTwice(userAgent?: string)
    {
        const { DOMAdapter } = await import('~/environment/adapter');
        const { getAsset, getWebGLRenderer } = await import('@test-utils');
        const { VideoSource } = await import('~/rendering/renderers/shared/texture/sources/VideoSource');
        const original = DOMAdapter.get();

        if (userAgent)
        {
            DOMAdapter.set({ ...original, getNavigator: () => ({ userAgent, gpu: null }) });
        }

        const renderer = await getWebGLRenderer();
        const video = document.createElement('video');

        video.src = getAsset('video/park.mp4');

        const source = new VideoSource({ resource: video, autoPlay: false });

        await source.load();

        const texImage2D = jest.spyOn(renderer.gl, 'texImage2D');
        const texSubImage2D = jest.spyOn(renderer.gl, 'texSubImage2D');

        try
        {
            renderer.texture.initSource(source);
            texImage2D.mockClear();
            texSubImage2D.mockClear();

            source.update();

            return { reallocated: texImage2D.mock.calls.length, updatedInPlace: texSubImage2D.mock.calls.length };
        }
        finally
        {
            texImage2D.mockRestore();
            texSubImage2D.mockRestore();
            source.destroy();
            renderer.destroy();
            DOMAdapter.set(original);
        }
    }

    it('should re-allocate each video frame when the adapter set after import reports Safari', async () =>
    {
        expect(await uploadVideoFrameTwice(SAFARI_UA)).toEqual({ reallocated: 1, updatedInPlace: 0 });
    });

    it('should update video frames in place outside Safari', async () =>
    {
        expect(await uploadVideoFrameTwice()).toEqual({ reallocated: 0, updatedInPlace: 1 });
    });
});
