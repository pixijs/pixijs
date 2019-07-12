const { resources } = require('../');
const {
    autoDetectResource,
    INSTALLED,
    CanvasResource,
    ImageResource,
    VideoResource,
    SVGResource } = resources;

describe('PIXI.resources.autoDetectResource', function ()
{
    it('should have api', function ()
    {
        expect(autoDetectResource).to.be.a.function;
    });

    it('should have installed resources', function ()
    {
        expect(INSTALLED).to.be.an.array;
        expect(INSTALLED.length).to.equal(8);
    });

    it('should auto-detect canvas element', function ()
    {
        const canvas = document.createElement('canvas');

        canvas.width = 200;
        canvas.height = 100;

        const resource = autoDetectResource(canvas);

        expect(resource).is.instanceOf(CanvasResource);
        expect(resource.width).to.equal(200);
        expect(resource.height).to.equal(100);
    });

    it('should auto-detect video element', function ()
    {
        const video = document.createElement('video');
        const resource = autoDetectResource(video);

        expect(resource).is.instanceOf(VideoResource);
    });

    it('should auto-detect image element', function ()
    {
        const img = new Image();
        const resource = autoDetectResource(img);

        expect(resource).is.instanceOf(ImageResource);
    });

    it('should auto-detect image string', function ()
    {
        const img = 'foo.png';
        const resource = autoDetectResource(img);

        expect(resource).is.instanceOf(ImageResource);
    });

    it('should auto-detect svg string', function ()
    {
        const svg = 'foo.svg';
        const resource = autoDetectResource(svg);

        expect(resource).is.instanceOf(SVGResource);
    });

    it('should auto-detect video Url', function ()
    {
        const video = 'foo.mp4';
        const resource = autoDetectResource(video);

        expect(resource).is.instanceOf(VideoResource);
    });

    it('should pass null', function ()
    {
        const resource = autoDetectResource(null);

        expect(resource).to.equal(null);
    });
});
