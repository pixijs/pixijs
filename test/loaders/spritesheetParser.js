'use strict';

const path = require('path');

describe('PIXI.loaders.spritesheetParser', function ()
{
    it('should exist and return a function', function ()
    {
        expect(PIXI.loaders.spritesheetParser).to.be.a('function');
        expect(PIXI.loaders.spritesheetParser()).to.be.a('function');
    });

    it('should do nothing if the resource is not JSON', function ()
    {
        const spy = sinon.spy();
        const res = {};

        PIXI.loaders.spritesheetParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    it('should do nothing if the resource is JSON, but improper format', function ()
    {
        const spy = sinon.spy();
        const res = createMockResource(PIXI.loaders.Resource.TYPE.JSON, {});

        PIXI.loaders.spritesheetParser()(res, spy);

        expect(spy).to.have.been.calledOnce;
        expect(res.textures).to.be.undefined;
    });

    it('should load the image & create textures if json is properly formatted', function ()
    {
        const spy = sinon.spy();
        const res = createMockResource(PIXI.loaders.Resource.TYPE.JSON, getJsonSpritesheet());
        const loader = new PIXI.loaders.Loader();
        const addStub = sinon.stub(loader, 'add');
        const imgRes = createMockResource(PIXI.loaders.Resource.TYPE.IMAGE, new Image());

        imgRes.texture = new PIXI.Texture(new PIXI.BaseTexture(imgRes.data));

        addStub.yields(imgRes);

        PIXI.loaders.spritesheetParser().call(loader, res, spy);

        addStub.restore();

        expect(spy).to.have.been.calledOnce;
        expect(addStub).to.have.been.calledWith(
            `${res.name}_image`,
            `${path.dirname(res.url)}/${res.data.meta.image}`
        );
        expect(res).to.have.property('textures')
            .that.is.an('object')
            .with.keys(Object.keys(getJsonSpritesheet().frames))
            .and.has.property('0.png')
                .that.is.an.instanceof(PIXI.Texture);
    });

    it('should build the image url', function ()
    {
        function getResourcePath(url, image)
        {
            return PIXI.loaders.getResourcePath({
                url,
                data: { meta: { image } },
            });
        }

        let result = getResourcePath('http://some.com/spritesheet.json', 'img.png');

        expect(result).to.be.equals('http://some.com/img.png');

        result = getResourcePath('http://some.com/some/dir/spritesheet.json', 'img.png');
        expect(result).to.be.equals('http://some.com/some/dir/img.png');

        result = getResourcePath('http://some.com/some/dir/spritesheet.json', './img.png');
        expect(result).to.be.equals('http://some.com/some/dir/img.png');

        result = getResourcePath('http://some.com/some/dir/spritesheet.json', '../img.png');
        expect(result).to.be.equals('http://some.com/some/img.png');

        result = getResourcePath('/spritesheet.json', 'img.png');
        expect(result).to.be.equals('/img.png');

        result = getResourcePath('/some/dir/spritesheet.json', 'img.png');
        expect(result).to.be.equals('/some/dir/img.png');

        result = getResourcePath('/some/dir/spritesheet.json', './img.png');
        expect(result).to.be.equals('/some/dir/img.png');

        result = getResourcePath('/some/dir/spritesheet.json', '../img.png');
        expect(result).to.be.equals('/some/img.png');
    });

    // TODO: Test that rectangles are created correctly.
    // TODO: Test that bathc processing works correctly.
    // TODO: Test that resolution processing works correctly.
    // TODO: Test that metadata is honored.
});

function createMockResource(type, data)
{
    const name = `${Math.floor(Date.now() * Math.random())}`;

    return {
        url: `http://localhost/doesnt_exist/${name}`,
        name,
        type,
        data,
        metadata: {},
    };
}

function getJsonSpritesheet()
{
    /* eslint-disable */
    return {"frames": {
    "0.png":
    {
        "frame": {"x":14,"y":28,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "1.png":
    {
        "frame": {"x":14,"y":42,"w":12,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":12,"h":14},
        "sourceSize": {"w":12,"h":14}
    },
    "2.png":
    {
        "frame": {"x":14,"y":14,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "3.png":
    {
        "frame": {"x":42,"y":0,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "4.png":
    {
        "frame": {"x":28,"y":0,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "5.png":
    {
        "frame": {"x":14,"y":0,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "6.png":
    {
        "frame": {"x":0,"y":42,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "7.png":
    {
        "frame": {"x":0,"y":28,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "8.png":
    {
        "frame": {"x":0,"y":14,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    },
    "9.png":
    {
        "frame": {"x":0,"y":0,"w":14,"h":14},
        "rotated": false,
        "trimmed": false,
        "spriteSourceSize": {"x":0,"y":0,"w":14,"h":14},
        "sourceSize": {"w":14,"h":14}
    }},
    "meta": {
        "app": "http://www.texturepacker.com",
        "version": "1.0",
        "image": "hud.png",
        "format": "RGBA8888",
        "size": {"w":64,"h":64},
        "scale": "1",
        "smartupdate": "$TexturePacker:SmartUpdate:47025c98c8b10634b75172d4ed7e7edc$"
    }
    };
    /* eslint-enable */
}
