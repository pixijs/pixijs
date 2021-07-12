const { AppLoaderPlugin, Loader } = require('../');

describe('PIXI.AppLoaderPlugin', function ()
{
    it('should contain loader property', function ()
    {
        const obj = {};

        AppLoaderPlugin.init.call(obj);

        expect(obj.loader).to.be.not.undefined;
        expect(obj.loader).to.be.instanceof(Loader);

        AppLoaderPlugin.destroy.call(obj);

        expect(obj.loader).to.be.null;
    });

    it('should use sharedLoader option', function ()
    {
        const obj = {};

        AppLoaderPlugin.init.call(obj, { sharedLoader: true });

        expect(obj.loader).to.be.not.undefined;
        expect(obj.loader).to.be.instanceof(Loader);
        expect(obj.loader).to.equal(Loader.shared);

        AppLoaderPlugin.destroy.call(obj);

        expect(obj.loader).to.be.null;
    });
});
