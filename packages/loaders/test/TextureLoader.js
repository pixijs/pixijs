const { TextureLoader, LoaderResource } = require('../');
const { Texture } = require('@pixi/core');
const { BaseTextureCache, TextureCache } = require('@pixi/utils');

describe('PIXI.TextureLoader', function ()
{
    it('should exist and return a function', function ()
    {
        expect(TextureLoader).to.not.be.undefined;
        expect(TextureLoader.use).to.be.a('function');
    });

    it('should do nothing if the resource is not an image', function ()
    {
        const spy = sinon.spy();
        const res = {};

        TextureLoader.use(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.texture).to.be.undefined;
    });

    it('should create a texture if resource is an image', function ()
    {
        const spy = sinon.spy();
        const res = createMockResource(LoaderResource.TYPE.IMAGE, new Image());

        TextureLoader.use(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.texture).to.be.an.instanceof(Texture);

        expect(BaseTextureCache).to.have.property(res.name, res.texture.baseTexture);
        expect(BaseTextureCache).to.have.property(res.url, res.texture.baseTexture);

        expect(TextureCache).to.have.property(res.name, res.texture);
        expect(TextureCache).to.have.property(res.url, res.texture);
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
