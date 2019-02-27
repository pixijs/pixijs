const { resources } = require('../');
const { ArrayResource, ImageResource } = resources;
const { join } = require('path');

describe('PIXI.resources.ArrayResource', function ()
{
    before(function ()
    {
        this.basePath = join(__dirname, 'resources');
        this.imageUrl = join(this.basePath, 'slug.png');
    });

    it('should create new resource by length', function ()
    {
        const resource = new ArrayResource(5, { width: 100, height: 100 });

        resource.destroy();
        expect(resource.destroyed).to.be.true;
    });

    it('should error on out of bound', function ()
    {
        const resource = new ArrayResource(5, { width: 100, height: 100 });
        const image = new ImageResource(this.imageUrl);

        expect(() => resource.addResourceAt(image, 10)).to.throw(Error, /out of bounds/);

        resource.destroy();
    });

    it('should load array of URL resources', function ()
    {
        const images = [
            this.imageUrl,
            this.imageUrl,
            this.imageUrl,
            this.imageUrl,
        ];

        const resource = new ArrayResource(images, {
            width: 100,
            height: 100,
            autoLoad: false,
        });
        const baseTexture = {
            setRealSize: sinon.stub(),
            update: sinon.stub(),
        };

        resource.bind(baseTexture);

        return resource.load().then((res) =>
        {
            expect(res).to.equal(resource);
            expect(baseTexture.setRealSize.calledOnce).to.be.true;
            for (let i = 0; i < images.length; i++)
            {
                const item = resource.items[i].resource;

                expect(item.valid).to.be.true;
                expect(item.width).to.equal(100);
                expect(item.height).to.equal(100);
            }
            resource.unbind(baseTexture);
            resource.destroy();
        });
    });
});
