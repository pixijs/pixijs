import { expect } from 'chai';
import { autoDetectResource,
    INSTALLED,
    CanvasResource,
    ImageResource,
    VideoResource,
    SVGResource } from '@pixi/core';

describe('autoDetectResource', () =>
{
    it('should have api', () =>
    {
        expect(autoDetectResource).to.be.a('function');
    });

    it('should have installed resources', () =>
    {
        expect(INSTALLED).to.be.an('array');
        expect(INSTALLED.length).to.equal(8);
    });

    it('should auto-detect canvas element', () =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = 200;
        canvas.height = 100;

        const resource = autoDetectResource(canvas);

        expect(resource).is.instanceOf(CanvasResource);
        expect(resource.width).to.equal(200);
        expect(resource.height).to.equal(100);
    });

    it('should auto-detect video element', () =>
    {
        const video = document.createElement('video');
        const resource = autoDetectResource(video);

        expect(resource).is.instanceOf(VideoResource);
    });

    it('should auto-detect image element', () =>
    {
        const img = new Image();
        const resource = autoDetectResource(img);

        expect(resource).is.instanceOf(ImageResource);
    });

    it('should auto-detect image string', () =>
    {
        const img = 'foo.png';
        const resource = autoDetectResource(img);

        expect(resource).is.instanceOf(ImageResource);
    });

    it('should auto-detect svg string', () =>
    {
        const svg = 'foo.svg';
        const resource = autoDetectResource(svg);

        expect(resource).is.instanceOf(SVGResource);
    });

    it('should auto-detect video Url', () =>
    {
        const video = 'foo.mp4';
        const resource = autoDetectResource(video);

        expect(resource).is.instanceOf(VideoResource);
    });

    it('should pass null', () =>
    {
        const resource = autoDetectResource(null);

        expect(resource).to.equal(null);
    });

    it('should throw for unknown types', () =>
    {
        expect(() => autoDetectResource({})).throws;
        expect(() => autoDetectResource(document.createElement('input'))).throws;
        expect(() => autoDetectResource(2)).throws;
        expect(() => autoDetectResource(true)).throws;
    });
});
