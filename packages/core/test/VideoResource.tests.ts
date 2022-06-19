import { VideoResource } from '@pixi/core';
import path from 'path';
import { expect } from 'chai';

describe('VideoResource', () =>
{
    let videoUrl: string;

    beforeAll(() =>
    {
        videoUrl = path.resolve(__dirname, 'resources', 'small.mp4');
    });

    it('should create new resource', () =>
    {
        const resource = new VideoResource(videoUrl, { autoLoad: false });

        expect(resource.width).toEqual(0);
        expect(resource.height).toEqual(0);
        expect(resource.valid).toBe(false);
        expect(resource.source).toBeInstanceOf(HTMLVideoElement);

        resource.destroy();
    });

    it('should load new resource', () =>
    {
        const resource = new VideoResource(videoUrl, {
            autoLoad: false,
            autoPlay: false,
        });

        return resource.load().then((res) =>
        {
            expect(res).toEqual(resource);
            expect(res.width).toEqual(560);
            expect(res.height).toEqual(320);
            expect(res.valid).toBe(true);
            resource.destroy();
        });
    });

    it('should find correct video extension from Url', () =>
    {
        const resource = new VideoResource('https://example.org/video.webm', {
            autoLoad: false,
            autoPlay: false,
        });

        // @ts-expect-error ---
        expect(resource.source.firstChild.type).to.be.equals('video/webm');

        resource.destroy();
    });

    it('should get video extension without being thrown by query string', () =>
    {
        const resource = new VideoResource('/test.mp4?123...', {
            autoLoad: false,
            autoPlay: false,
        });

        // @ts-expect-error ---
        expect(resource.source.firstChild.type).to.be.equals('video/mp4');

        resource.destroy();
    });

    it('should respect the updateFPS settings property and getter / setter', () =>
    {
        const resource = new VideoResource(videoUrl, {
            autoLoad: false,
            autoPlay: false,
            updateFPS: 30,
        });

        return resource.load().then((res) =>
        {
            expect(res).toEqual(resource);
            expect(res.updateFPS).toEqual(30);
            res.updateFPS = 20;
            expect(res.updateFPS).toEqual(20);
            resource.destroy();
        });
    });
});

