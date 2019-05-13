const { resources, BaseTexture } = require('../');
const { CanvasResource } = resources;

describe('PIXI.resources.CanvasResource', function ()
{
    it('should create new dimension-less resource', function ()
    {
        const canvas = document.createElement('canvas');

        const resource = new CanvasResource(canvas);

        expect(resource.width).to.equal(canvas.width);
        expect(resource.height).to.equal(canvas.height);
        expect(resource.valid).to.be.true;

        resource.destroy();
    });

    it('should create new valid resource', function ()
    {
        const canvas = document.createElement('canvas');

        canvas.width = 100;
        canvas.height = 200;

        const resource = new CanvasResource(canvas);

        expect(resource.width).to.equal(100);
        expect(resource.height).to.equal(200);
        expect(resource.valid).to.be.true;

        resource.destroy();
    });

    it('should fire resize event on bind', function ()
    {
        const canvas = document.createElement('canvas');
        const resource = new CanvasResource(canvas);
        const baseTexture = { setRealSize: sinon.stub() };

        resource.bind(baseTexture);

        expect(baseTexture.setRealSize.calledOnce).to.be.true;

        resource.unbind(baseTexture);
        resource.destroy();
    });

    it('should fire manual update event', function ()
    {
        const canvas = document.createElement('canvas');
        const resource = new CanvasResource(canvas);
        const baseTexture = { update: sinon.stub() };

        resource.bind(baseTexture);

        expect(baseTexture.update.called).to.be.false;

        resource.update();

        expect(baseTexture.update.calledOnce).to.be.true;

        resource.unbind(baseTexture);
        resource.destroy();
    });

    it('should change BaseTexture size on update', function ()
    {
        const canvas = document.createElement('canvas');

        canvas.width = 50;
        canvas.height = 50;

        const resource = new CanvasResource(canvas);
        const baseTexture = new BaseTexture(resource);

        expect(baseTexture.width).to.equal(50);
        canvas.width = 100;
        resource.update();
        expect(baseTexture.width).to.equal(100);
        canvas.height = 70;
        resource.update();
        expect(baseTexture.height).to.equal(70);
        resource.destroy();
    });
});
