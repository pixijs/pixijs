const { resources } = require('../');
const { ImageResource } = resources;
const path = require('path');

describe('PIXI.resources.ImageResource', function ()
{
    before(function ()
    {
        this.slugUrl = path.resolve(__dirname, 'resources', 'slug.png');
    });

    it('should create new dimension-less resource', function ()
    {
        const image = new Image();

        const resource = new ImageResource(image);

        expect(resource.width).to.equal(0);
        expect(resource.height).to.equal(0);
        expect(resource.valid).to.be.false;
        expect(resource.url).to.equal('');

        resource.destroy();
    });

    it('should destroy resource multiple times', function ()
    {
        const resource = new ImageResource(new Image());

        resource.destroy();
        resource.destroy();
    });

    it('should create new valid resource from HTMLImageElement', function ()
    {
        const image = new Image();

        image.src = this.slugUrl;

        const resource = new ImageResource(image);

        expect(resource.width).to.equal(0);
        expect(resource.height).to.equal(0);
        expect(resource.valid).to.be.false;
        if (this.slugUrl.indexOf('\\') < 0)
        {
            // unix
            expect(resource.url).to.equal(`file://${this.slugUrl}`);
        }
        else
        {
            // windows
            const resourceUrl = resource.url.toLowerCase();
            const windowsUrl = `file:///${this.slugUrl.replace(/\\/g, '/').toLowerCase()}`;

            expect(resourceUrl).to.be.equals(windowsUrl);
        }

        resource.destroy();
    });

    it('should handle the loaded event with createBitmapImage', function ()
    {
        const image = new Image();

        image.src = this.slugUrl;

        const resource = new ImageResource(image, { autoLoad: false });

        return resource.load().then((res) =>
        {
            expect(res).to.equal(resource);
            expect(resource.width).to.equal(100);
            expect(resource.height).to.equal(100);
            expect(resource.valid).to.be.true;
            expect(resource.bitmap).to.be.instanceof(ImageBitmap);
        });
    });

    it('should handle the loaded event with no createBitmapImage', function ()
    {
        const image = new Image();

        image.src = this.slugUrl;

        const resource = new ImageResource(image, {
            autoLoad: false,
            createBitmap: false,
        });

        return resource.load().then((res) =>
        {
            expect(res).to.equal(resource);
            expect(resource.width).to.equal(100);
            expect(resource.height).to.equal(100);
            expect(resource.valid).to.be.true;
            expect(resource.bitmap).to.be.null;
        });
    });
});
