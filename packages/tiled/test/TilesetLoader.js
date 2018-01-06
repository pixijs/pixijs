const path = require('path');

const { Loader, LoaderResource } = require('@pixi/loaders');
const { BaseTexture, Texture } = require('@pixi/core');

const { TilesetLoader } = require('../');

const baseUrl = 'http://host.invalid/tileset-loader';

describe('PIXI.TilesetLoader', () =>
{
    it('exists and returns a function', () =>
    {
        expect(TilesetLoader).to.not.be.undefined;
        expect(TilesetLoader.use).to.be.a('function');
    });

    it('installs middleware', (done) =>
    {
        Loader.registerPlugin(TilesetLoader);

        const loader = new Loader();

        loader.add('building1', path.join(__dirname, 'resources/building1.tsx'));
        loader.load((loader, resources) =>
        {
            expect(resources.building1).to.be.instanceof(LoaderResource);
            expect(resources.building1.texture).to.be.instanceof(Texture);
            expect(resources.building1_image).to.be.instanceof(LoaderResource);
            expect(resources.building1_image.url).to.equal(path.join(__dirname, 'resources/building1.png'));
            loader.reset();
            done();
        });
    });

    it('does nothing if the resource is not a document', () =>
    {
        const spy = sinon.spy();
        const resource = {};

        TilesetLoader.use(resource, spy);

        expect(spy).to.have.been.calledOnce;
        expect(resource.textures).to.be.undefined;
    });

    it('does nothing if the resource is a document, but with wrong extension', () =>
    {
        const spy = sinon.spy();
        const resource = createMockResource(LoaderResource.TYPE.XML, createEmptyTileset(), 'xml');

        TilesetLoader.use(resource, spy);

        expect(spy).to.have.been.calledOnce;
        expect(resource.textures).to.be.undefined;
    });

    it('does nothing if the resource is a document with tsx extension, but without image tag', () =>
    {
        const spy = sinon.spy();
        const resource = createMockResource(LoaderResource.TYPE.XML, createEmptyTileset(), 'tsx');

        TilesetLoader.use(resource, spy);

        expect(spy).to.have.been.calledOnce;
        expect(resource.textures).to.be.undefined;
    });

    it('loads the image and creates a texture for a tileset', () =>
    {
        const spy = sinon.spy();
        const tileset = createEmptyTileset();
        const imagePath = '../images/tiles.png';
        const imageElement = tileset.createElement('image');

        imageElement.setAttribute('source', imagePath);
        tileset.documentElement.appendChild(imageElement);

        const resource = createMockResource(LoaderResource.TYPE.XML, tileset, 'tsx');
        const loader = new Loader();
        const addStub = sinon.stub(loader, 'add');
        const imageResource = createMockResource(LoaderResource.TYPE.IMAGE, new Image(), 'png');

        imageResource.texture = new Texture(new BaseTexture(imageResource.data));

        addStub.yields(imageResource);

        TilesetLoader.use.call(loader, resource, spy);

        addStub.restore();

        expect(spy).to.have.been.calledOnce;
        expect(addStub).to.have.been.calledWith(
            `${resource.name}_image`,
            `${baseUrl}/images/tiles.png`
        );
        expect(resource).to.have.property('texture')
            .that.is.an.instanceof(Texture);
    });
});

function createEmptyTileset()
{
    const tileset = document.implementation.createDocument(null, 'tileset', null);

    return tileset;
}

function createMockResource(type, data, extension)
{
    const name = `${Math.floor(Date.now() * Math.random())}`;

    return {
        url: `${baseUrl}/tilesets/${name}`,
        name,
        type,
        data,
        extension,
    };
}

