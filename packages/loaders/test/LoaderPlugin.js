const { LoaderPlugin, Loader } = require('../');

describe('PIXI.LoaderPlugin', function ()
{
    it('should contain loader property', function ()
    {
        const obj = {};

        LoaderPlugin.init.call(obj);

        expect(obj.loader).to.be.not.undefined;
        expect(obj.loader).to.be.instanceof(Loader);

        LoaderPlugin.destroy.call(obj);

        expect(obj.loader).to.be.null;
    });

    it('should use sharedLoader option', function ()
    {
        const obj = {};

        LoaderPlugin.init.call(obj, { sharedLoader: true });

        expect(obj.loader).to.be.not.undefined;
        expect(obj.loader).to.be.instanceof(Loader);
        expect(obj.loader).to.equal(Loader.shared);

        LoaderPlugin.destroy.call(obj);

        expect(obj.loader).to.be.null;
    });
});
