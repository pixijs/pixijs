const { Loader } = require('../');

describe('PIXI.Loader', function ()
{
    it('should exist', function ()
    {
        expect(Loader).to.be.a('function');
    });

    it('should have shared loader', function ()
    {
        expect(Loader.shared).to.not.be.undefined;
        expect(Loader.shared).to.be.instanceof(Loader);
    });
});
