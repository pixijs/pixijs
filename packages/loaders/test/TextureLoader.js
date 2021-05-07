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

    it('should create a texture if resource is an image', function (done)
    {
        const name = `${(Math.random() * 10000) | 0}`;
        const url = `http://localhost/doesnt_exist/${name}`;
        const data = new Image();
        const type = LoaderResource.TYPE.IMAGE;
        const res = { url, name, type, data, metadata: {} };

        // Transparent image
        data.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ'
            + 'AAAADUlEQVQYV2P4GvD7PwAHvgNAdItKlAAAAABJRU5ErkJggg==';

        TextureLoader.use(res, () =>
        {
            expect(res.texture).to.be.an.instanceof(Texture);

            expect(BaseTextureCache).to.have.property(res.name, res.texture.baseTexture);
            expect(BaseTextureCache).to.have.property(res.url, res.texture.baseTexture);

            expect(TextureCache).to.have.property(res.name, res.texture);
            expect(TextureCache).to.have.property(res.url, res.texture);

            done();
        });
    });
});
