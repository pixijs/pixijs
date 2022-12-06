import {
    autoDetectResource,
    CanvasResource,
    ImageResource,
    INSTALLED,
    SVGResource,
    VideoResource,
} from '@pixi/core';

describe('autoDetectResource', () =>
{
    it('should have api', () =>
    {
        expect(autoDetectResource).toBeInstanceOf(Function);
    });

    it('should have installed resources', () =>
    {
        expect(INSTALLED).toBeArray();
        expect(INSTALLED.length).toEqual(8);
    });

    it('should auto-detect canvas element', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 200;
        canvas.height = 100;

        const resource = autoDetectResource(canvas);

        expect(resource).toBeInstanceOf(CanvasResource);
        expect(resource.width).toEqual(200);
        expect(resource.height).toEqual(100);
    });

    it('should auto-detect video element', () =>
    {
        const video = document.createElement('video');
        const resource = autoDetectResource(video);

        expect(resource).toBeInstanceOf(VideoResource);
    });

    it('should auto-detect image element', () =>
    {
        const img = new Image();
        const resource = autoDetectResource(img);

        expect(resource).toBeInstanceOf(ImageResource);
    });

    it('should auto-detect image string', () =>
    {
        const img = 'foo.png';
        const resource = autoDetectResource(img);

        expect(resource).toBeInstanceOf(ImageResource);
    });

    it('should auto-detect svg string', () =>
    {
        const svg = 'foo.svg';
        const resource = autoDetectResource(svg);

        expect(resource).toBeInstanceOf(SVGResource);
    });

    it('should auto-detect video Url', () =>
    {
        const video = 'foo.mp4';
        const resource = autoDetectResource(video);

        expect(resource).toBeInstanceOf(VideoResource);
    });

    it('should pass null', () =>
    {
        const resource = autoDetectResource(null);

        expect(resource).toEqual(null);
    });

    it('should throw for unknown types', () =>
    {
        expect(() => autoDetectResource({})).toThrow();
        expect(() => autoDetectResource(document.createElement('input'))).toThrow();
        expect(() => autoDetectResource(2)).toThrow();
        expect(() => autoDetectResource(true)).toThrow();
    });
});
