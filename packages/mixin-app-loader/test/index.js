const { Application } = require('@pixi/app');
const { Loader, shared } = require('@pixi/loaders');
const { skipHello } = require('@pixi/utils');

require('../');

skipHello();

describe('PIXI.Application#loader', function ()
{
    it('should contain loader property', function ()
    {
        const obj = new Application();

        expect(obj.loader).to.be.not.undefined;
        expect(obj.loader).to.be.instanceof(Loader);

        obj.destroy();

        expect(obj.loader).to.be.null;
    });

    it('should use sharedLoader option', function ()
    {
        const obj = new Application({ sharedLoader: true });

        expect(obj.loader).to.be.not.undefined;
        expect(obj.loader).to.be.instanceof(Loader);
        expect(obj.loader).to.equal(shared);

        obj.destroy();

        expect(obj.loader).to.be.null;
    });
});
