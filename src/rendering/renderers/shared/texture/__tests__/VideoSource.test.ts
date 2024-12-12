import '~/environment-browser/browserAll';
import { VideoSource } from '../sources/VideoSource';
import { getAsset } from '@test-utils';
import { Assets } from '~/assets';

import type { VideoSourceOptions } from '../sources/VideoSource';
import type { Texture } from '../Texture';

const url = getAsset('video/park.mp4');

describe('VideoSource', () =>
{
    const setup = async (options?: VideoSourceOptions, forceUrl?: string) =>
    {
        const texture = await Assets.load<Texture<VideoSource>>({
            src: forceUrl ?? url,
            data: options
        });
        const source = texture.source;
        const sourceElement = source.resource.firstElementChild as HTMLSourceElement;

        return { source, sourceElement };
    };

    beforeEach(() =>
    {
        // clear the cache since we're creating new properties for the existing source
        Assets.reset();
    });

    it('should create new source', async () =>
    {
        const { source, sourceElement } = await setup();

        expect(source.resource).toBeInstanceOf(HTMLVideoElement);
        expect(sourceElement.src).toEqual(url);

        // expect initial state to have dimensions (loadVideoTextures loader waits for canplay before resolving)
        expect(source.width).toEqual(1920);
        expect(source.height).toEqual(1080);
        expect(source.pixelWidth).toEqual(1920);
        expect(source.pixelHeight).toEqual(1080);
        expect(source.isReady).toBe(true);
        expect(source.isValid).toBe(true);
    });

    it('should load new source', async () =>
    {
        const { source: videoSource } = await setup();

        const source = await videoSource.load();

        expect(source).toEqual(videoSource);
        expect(source.width).toEqual(1920);
        expect(source.height).toEqual(1080);
        expect(source.isValid).toBe(true);
        expect(source.isReady).toBe(true);
    });

    it('should find correct video extension from Url', async () =>
    {
        const { sourceElement } = await setup();

        expect(sourceElement.type).toEqual('video/mp4');
    });

    it('should get video extension without being thrown by query string', async () =>
    {
        const { sourceElement } = await setup({}, `${url}?some=param`);

        expect(sourceElement.type).toEqual('video/mp4');
    });

    it('should respect the updateFPS settings property and getter / setter', async () =>
    {
        const { source } = await setup({ updateFPS: 30 });

        await source.load();

        expect(source.updateFPS).toEqual(30);
        source.updateFPS = 20;
        expect(source.updateFPS).toEqual(20);
    });

    it('should load data URL', async () =>
    {
        // eslint-disable-next-line max-len
        const webmDataURL = 'data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAHTEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggG97AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBArqBApqBAlPAgQFVsIRVuYEBElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dcfngQCgwqGggQAAAIJJg0IAABAAFgA4JBwYSgAAICAAEb///4r+AAB1oZ2mm+6BAaWWgkmDQgAAEAAWADgkHBhKAAAgIABIQBxTu2uRu4+zgQC3iveBAfGCAXHwgQM=';
        const { source } = await setup({}, webmDataURL);

        await expect(source.load()).toResolve();
    });

    it('should not hang on load if an error occurs', async () =>
    {
        const video = document.createElement('video');

        video.autoplay = false;
        video.crossOrigin = 'anonymous';
        video.preload = 'auto';
        video.src = 'data:video/webm;base64,';

        const source = new VideoSource({
            resource: video,
            autoLoad: false,
        });

        expect(source.width).toEqual(0);
        expect(source.height).toEqual(0);
        expect(source.isReady).toBe(false);
        expect(source.isValid).toBe(false);
        expect(source.resource).toBeInstanceOf(HTMLVideoElement);

        const errorOnLoad = new Promise<boolean>((resolve) =>
        {
            source.resource.addEventListener('loadeddata', () => resolve(false));
            source.resource.addEventListener('error', () => resolve(true));
        });

        const loadPromise = source.load();

        await expect(errorOnLoad).toResolve();
        expect(await errorOnLoad).toBe(true);
        await expect(loadPromise).toReject();
    });

    it('should wait until fully loaded if preload option is true', async () =>
    {
        const { source } = await setup({ preload: true, autoLoad: false }); // autoLoad=false to give us time to add spies
        const mediaReadySpy = jest.spyOn(source as any, '_mediaReady');
        const canPlaySpy = jest.spyOn(source as any, '_onCanPlay');
        const canPlayThroughSpy = jest.spyOn(source as any, '_onCanPlayThrough');

        await source.load();

        expect(mediaReadySpy).toHaveBeenCalled();
        expect(canPlaySpy).not.toHaveBeenCalled();
        expect(canPlayThroughSpy).not.toHaveBeenCalled();
    });
});

