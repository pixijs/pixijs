'use strict';

describe('PIXI.loaders.textureParser', function ()
{
    it('should exist and return a function', function ()
    {
        expect(PIXI.loaders.textureParser).to.be.a('function');
        expect(PIXI.loaders.textureParser()).to.be.a('function');
    });

    it('should do nothing if the resource is not an image', function ()
    {
        const spy = sinon.spy();
        const res = {};

        PIXI.loaders.textureParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.texture).to.be.undefined;
    });

    it('should create a texture if resource is an image', function ()
    {
        const spy = sinon.spy();
        const res = createMockResource(PIXI.loaders.Resource.TYPE.IMAGE, new Image());

        PIXI.loaders.textureParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.texture).to.be.an.instanceof(PIXI.Texture);

        expect(PIXI.utils.BaseTextureCache).to.have.property(res.name, res.texture.baseTexture);
        expect(PIXI.utils.BaseTextureCache).to.have.property(res.url, res.texture.baseTexture);

        expect(PIXI.utils.TextureCache).to.have.property(res.name, res.texture);
        expect(PIXI.utils.TextureCache).to.have.property(res.url, res.texture);
    });
});

function createMockResource(type, data)
{
    const name = `${Math.floor(Date.now() * Math.random())}`;

    return {
        url: `http://localhost/doesnt_exist/${name}`,
        name,
        type,
        data,
    };
}
