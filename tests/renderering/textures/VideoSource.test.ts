import path from 'path';
import { VideoSource } from '../../../src/rendering/renderers/shared/texture/sources/VideoSource';

import type { VideoSourceOptions } from '../../../src/rendering/renderers/shared/texture/sources/VideoSource';

const url = path.resolve(__dirname, '../../assets/assets/video', 'park.mp4');

describe('VideoSource', () =>
{
    const setup = (options?: VideoSourceOptions, forceUrl?: string) =>
    {
        const source = VideoSource.from(forceUrl ?? url, {
            autoLoad: false,
            autoPlay: false,
            ...options,
        });
        const sourceElement = source.resource.firstElementChild as HTMLSourceElement;

        return { source, sourceElement };
    };

    it('should create new source', () =>
    {
        const { source, sourceElement } = setup();

        expect(source.resource).toBeInstanceOf(HTMLVideoElement);
        expect(sourceElement.src).toEqual(`file://${url}`);

        // expect initial state to be empty until loaded
        expect(source.width).toEqual(0);
        expect(source.height).toEqual(0);
        expect(source.pixelWidth).toEqual(0);
        expect(source.pixelHeight).toEqual(0);
        expect(source.isReady).toBe(false);
        expect(source.isValid).toBe(false);

        source.destroy();
    });

    it('should load new source', async () =>
    {
        const { source: videoSource } = setup();

        const source = await videoSource.load();

        expect(source).toEqual(videoSource);
        expect(source.width).toEqual(1920);
        expect(source.height).toEqual(1080);
        expect(source.isValid).toBe(true);
        expect(source.isReady).toBe(true);

        source.destroy();
    });

    it('should find correct video extension from Url', () =>
    {
        const { source, sourceElement } = setup();

        expect(sourceElement.type).toEqual('video/mp4');

        source.destroy();
    });

    it('should get video extension without being thrown by query string', () =>
    {
        const { source, sourceElement } = setup({}, `${url}?some=param`);

        expect(sourceElement.type).toEqual('video/mp4');

        source.destroy();
    });

    it('should respect the updateFPS settings property and getter / setter', async () =>
    {
        const { source } = setup({ updateFPS: 30 });

        await source.load();

        expect(source.updateFPS).toEqual(30);
        source.updateFPS = 20;
        expect(source.updateFPS).toEqual(20);

        source.destroy();
    });

    it('should load data URL', async () =>
    {
        // eslint-disable-next-line max-len
        const webmDataURL = 'data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAHTEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggG97AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBArqBApqBAlPAgQFVsIRVuYEBElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dcfngQCgwqGggQAAAIJJg0IAABAAFgA4JBwYSgAAICAAEb///4r+AAB1oZ2mm+6BAaWWgkmDQgAAEAAWADgkHBhKAAAgIABIQBxTu2uRu4+zgQC3iveBAfGCAXHwgQM=';
        const { source } = setup({}, webmDataURL);

        await expect(source.load()).toResolve();

        source.destroy();
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

        source.destroy();
    });
});

