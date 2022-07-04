import path from 'path';
import type { IAddOptions } from '@pixi/loaders';
import { Loader, LoaderResource } from '@pixi/loaders';
import { Texture, BaseTexture, extensions } from '@pixi/core';
import { BaseTextureCache, TextureCache, url, clearTextureCache } from '@pixi/utils';
import { SpritesheetLoader, Spritesheet } from '@pixi/spritesheet';

describe('SpritesheetLoader', () =>
{
    beforeAll(() => extensions.add(SpritesheetLoader));
    afterAll(() => extensions.remove(SpritesheetLoader));

    it('should exist and return a function', () =>
    {
        expect(SpritesheetLoader).toBeDefined();
        expect(SpritesheetLoader.use).toBeInstanceOf(Function);
    });

    it('should install middleware', (done) =>
    {
        const loader = new Loader();
        const baseTextures = Object.keys(BaseTextureCache).length;
        const textures = Object.keys(TextureCache).length;

        loader.add('building1', path.join(__dirname, 'resources/building1.json'));
        loader.load((loader, resources) =>
        {
            expect(resources.building1).toBeInstanceOf(LoaderResource);
            expect(resources.building1.spritesheet).toBeInstanceOf(Spritesheet);
            resources.building1.spritesheet.destroy(true);
            expect(Object.keys(BaseTextureCache).length).toEqual(baseTextures);
            expect(Object.keys(TextureCache).length).toEqual(textures);
            loader.reset();
            done();
        });
    });

    it('should do nothing if the resource is not JSON', () =>
    {
        const spy = jest.fn();
        const res = {} as LoaderResource;

        SpritesheetLoader.use(res, spy);

        expect(spy).toHaveBeenCalledOnce();
        expect(res.textures).toBeUndefined();
    });

    it('should do nothing if the resource is JSON, but improper format', () =>
    {
        const spy = jest.fn();
        const res = createMockResource(LoaderResource.TYPE.JSON, {});

        SpritesheetLoader.use(res, spy);

        expect(spy).toHaveBeenCalledOnce();
        expect(res.textures).toBeUndefined();
    });

    it('should load the image & create textures if json is properly formatted', async () =>
    {
        jest.setTimeout(10000);
        const res = createMockResource(LoaderResource.TYPE.JSON, getJsonSpritesheet());
        const loader = new Loader();
        const imgRes = createMockResource(LoaderResource.TYPE.IMAGE, new Image());
        const addStub = jest.fn((_0, _1, _2, callback) =>
        {
            callback(imgRes);
        });

        loader.add = addStub as any;

        imgRes.texture = new Texture(new BaseTexture(imgRes.data));

        await new Promise<void>((resolve) =>
        {
            SpritesheetLoader.use.call(loader, res, () =>
            {
                resolve();
            });
        });

        expect(res).toHaveProperty('textures');
        expect(Object.keys(res.textures)).toEqual(Object.keys(getJsonSpritesheet().frames));
        expect(res.textures['0.png']).toBeInstanceOf(Texture);

        expect(res.textures['0.png'].frame.x).toEqual(14);
        expect(res.textures['0.png'].frame.y).toEqual(28);
        expect(res.textures['0.png'].defaultAnchor.x).toEqual(0.3);
        expect(res.textures['0.png'].defaultAnchor.y).toEqual(0.4);
        expect(res.textures['1.png'].defaultAnchor.x).toEqual(0.0); // default of defaultAnchor is 0,0
        expect(res.textures['1.png'].defaultAnchor.y).toEqual(0.0);

        expect(res).toHaveProperty('spritesheet');
        expect(res.spritesheet).toHaveProperty('animations');
        expect(res.spritesheet.animations).toHaveProperty('png123');
        expect(res.spritesheet.animations.png123.length).toEqual(3);
        expect(res.spritesheet.animations.png123[0]).toEqual(res.textures['1.png']);
    });

    it('should not load binary images as an image loader type', (done) =>
    {
        const loader = new Loader();

        // provide a mock pre-loader that creates an empty base texture for compressed texture assets
        // this is necessary because the SpriteSheetLoader expects a baseTexture on the resource
        loader.pre((resource, next) =>
        {
            if (resource.extension === 'crn')
            {
                resource.texture = Texture.EMPTY;
            }
            next();
        })
            .add(`atlas_crn`, path.join(__dirname, 'resources', 'atlas_crn.json'))
            .add(`atlas`, path.join(__dirname, 'resources', 'building1.json'))
            .load((loader, resources) =>
            {
                expect(resources.atlas_image.data).toBeInstanceOf(HTMLImageElement);
                expect(resources.atlas_crn_image.data).not.toBeInstanceOf(HTMLImageElement);
                loader.reset();
                done();
            });
    });

    it('should dispatch an error failing to load spritesheet image', (done) =>
    {
        const spy = jest.fn((error, _ldr, res) =>
        {
            expect(res.name).toEqual('atlas_error_image');
            expect(res.error).toEqual(error);
            expect(error.toString()).toContain('Failed to load element using: IMG');
        });
        const loader = new Loader();

        loader.add('atlas_error', path.join(__dirname, 'resources', 'atlas_error.json'));
        loader.onError.add(spy);
        loader.load((loader, resources) =>
        {
            expect(resources.atlas_error_image.error).toBeInstanceOf(Error);
            expect(spy).toBeCalledTimes(1);
            loader.reset();
            done();
        });
    });

    it('should build the image url', () =>
    {
        function getPath(url: string, image: string)
        {
            return SpritesheetLoader.getResourcePath(
                {
                    url,
                    data: { meta: { image } },
                } as LoaderResource,
                ''
            );
        }

        let result = getPath('http://some.com/spritesheet.json', 'img.png');

        expect(result).toEqual('http://some.com/img.png');

        result = getPath('http://some.com/some/dir/spritesheet.json', 'img.png');
        expect(result).toEqual('http://some.com/some/dir/img.png');

        result = getPath('http://some.com/some/dir/spritesheet.json', './img.png');
        expect(result).toEqual('http://some.com/some/dir/img.png');

        result = getPath('http://some.com/some/dir/spritesheet.json', '../img.png');
        expect(result).toEqual('http://some.com/some/img.png');

        result = getPath('/spritesheet.json', 'img.png');
        expect(result).toEqual('/img.png');

        result = getPath('/some/dir/spritesheet.json', 'img.png');
        expect(result).toEqual('/some/dir/img.png');

        result = getPath('/some/dir/spritesheet.json', './img.png');
        expect(result).toEqual('/some/dir/img.png');

        result = getPath('/some/dir/spritesheet.json', '../img.png');
        expect(result).toEqual('/some/img.png');
    });

    // TODO: Test that rectangles are created correctly.
    // TODO: Test that bathc processing works correctly.
    // TODO: Test that resolution processing works correctly.
    // TODO: Test that metadata is honored.

    it('should not add itself via multipack', (done) =>
    {
        // clear the caches only to avoid cluttering the output
        clearTextureCache();

        const loader = new Loader();

        loader.add('atlas_multi_self', path.join(__dirname, 'resources', 'building1-0.json'));
        loader.load((loader, resources) =>
        {
            expect(Object.values(resources).filter((r) => r.url.includes('building1-0.json')).length).toEqual(1);
            loader.reset();
            done();
        });
    });

    it('should create multipack resources when related_multi_packs field is an array of strings', (done) =>
    {
        // clear the caches only to avoid cluttering the output
        clearTextureCache();

        const loader = new Loader();

        loader.add('atlas_multi_child_check', path.join(__dirname, 'resources', 'building1-0.json'));
        loader.load((loader, resources) =>
        {
            expect(resources.atlas_multi_child_check.children.some((r) => r.url.includes('building1-1.json'))).toBe(true);
            loader.reset();
            done();
        });
    });

    it('should not create multipack resources when related_multi_packs field is missing or the wrong type', (done) =>
    {
        // clear the caches only to avoid cluttering the output
        clearTextureCache();

        const loader = new Loader();

        loader.add('atlas_no_multipack', path.join(__dirname, 'resources', 'building1.json'));
        loader.add('atlas_multipack_wrong_type', path.join(__dirname, 'resources', 'atlas-multipack-wrong-type.json'));
        loader.add('atlas_multipack_wrong_array', path.join(__dirname, 'resources', 'atlas-multipack-wrong-array.json'));
        loader.load((loader, resources) =>
        {
            expect(resources.atlas_no_multipack.children.length).toEqual(1);
            expect(resources.atlas_multipack_wrong_type.children.length).toEqual(1);
            expect(resources.atlas_multipack_wrong_array.children.length).toEqual(1);
            loader.reset();
            done();
        });
    });

    it('should build the multipack url', () =>
    {
        let result = url.resolve('http://some.com/spritesheet.json', 'spritesheet-1.json');

        expect(result).toEqual('http://some.com/spritesheet-1.json');

        result = url.resolve('http://some.com/some/dir/spritesheet.json', 'spritesheet-1.json');
        expect(result).toEqual('http://some.com/some/dir/spritesheet-1.json');

        result = url.resolve('http://some.com/some/dir/spritesheet.json', './spritesheet-1.json');
        expect(result).toEqual('http://some.com/some/dir/spritesheet-1.json');

        result = url.resolve('http://some.com/some/dir/spritesheet.json', '../spritesheet-1.json');
        expect(result).toEqual('http://some.com/some/spritesheet-1.json');

        result = url.resolve('/spritesheet.json', 'spritesheet-1.json');
        expect(result).toEqual('/spritesheet-1.json');

        result = url.resolve('/some/dir/spritesheet.json', 'spritesheet-1.json');
        expect(result).toEqual('/some/dir/spritesheet-1.json');

        result = url.resolve('/some/dir/spritesheet.json', './spritesheet-1.json');
        expect(result).toEqual('/some/dir/spritesheet-1.json');

        result = url.resolve('/some/dir/spritesheet.json', '../spritesheet-1.json');
        expect(result).toEqual('/some/spritesheet-1.json');
    });

    it('should use metadata to load all multipack resources', (done) =>
    {
        // clear the caches only to avoid cluttering the output
        clearTextureCache();

        const loader = new Loader();
        const metadata = { key: 'value' };

        loader.add('building1-0', path.join(__dirname, 'resources', 'building1-0.json'), { metadata } as IAddOptions);
        loader.load((_loader, resources) =>
        {
            expect(resources['building1-0'].metadata).toEqual(metadata);
            expect(resources['building1-1'].metadata).toEqual(metadata);

            done();
        });
    });
});

function createMockResource(type: LoaderResource.TYPE, data: any): LoaderResource
{
    const name = `${Math.floor(Date.now() * Math.random())}`;

    return {
        url: `http://localhost/doesnt_exist/${name}`,
        name,
        type,
        data,
        metadata: {},
    } as LoaderResource;
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
            "sourceSize": {"w":14,"h":14},
            "anchor": {"x":0.3,"y":0.4}
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
        "animations": {
            "png123": [ "1.png", "2.png", "3.png" ]
        },
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
