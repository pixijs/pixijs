const { resources } = require('../');
const { VideoResource } = resources;
const path = require('path');

describe('PIXI.resources.VideoResource', function ()
{
    before(function ()
    {
        this.videoUrl = path.resolve(__dirname, 'resources', 'small.mp4');
    });

    it('should create new resource', function ()
    {
        const resource = new VideoResource(this.videoUrl, { autoLoad: false });

        expect(resource.width).to.equal(0);
        expect(resource.height).to.equal(0);
        expect(resource.valid).to.be.false;
        expect(resource.source).to.be.instanceof(HTMLVideoElement);

        resource.destroy();
    });

    it('should load new resource', function ()
    {
        const resource = new VideoResource(this.videoUrl, {
            autoLoad: false,
            autoPlay: false,
        });

        return resource.load().then((res) =>
        {
            expect(res).to.equal(resource);
            expect(res.width).to.equal(560);
            expect(res.height).to.equal(320);
            expect(res.valid).to.be.true;
            resource.destroy();
        });
    });
});
