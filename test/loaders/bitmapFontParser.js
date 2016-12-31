'use strict';

describe('PIXI.loaders.bitmapFontParser', function ()
{
    it('should exist and return a function', function ()
    {
        expect(PIXI.loaders.bitmapFontParser).to.be.a('function');
        expect(PIXI.loaders.bitmapFontParser()).to.be.a('function');
    });

    it('should do nothing if the resource is not XML', function ()
    {
        const spy = sinon.spy();
        const res = {};

        PIXI.loaders.bitmapFontParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    it('should do nothing if the resource is not properly formatted XML', function ()
    {
        const spy = sinon.spy();
        const res = { data: document.createDocumentFragment() };

        PIXI.loaders.bitmapFontParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    // TODO: Test the texture cache code path.
    // TODO: Test the loading texture code path.
    // TODO: Test data-url code paths.
});

describe('PIXI.loaders.parseBitmapFontData', function ()
{
    it('should exist', function ()
    {
        expect(PIXI.loaders.parseBitmapFontData).to.be.a('function');
    });

    // TODO: Test the parser code.
});
