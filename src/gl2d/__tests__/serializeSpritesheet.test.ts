import '~/accessibility/init';
import '~/events/init';
import { Gl2d } from '../Gl2d';
import { type Gl2dPixiSpriteNode } from '../types/pixi/PixiGl2dNodes';
import { type Gl2dPixiSpritesheetResource, type Gl2dPixiTextureResource } from '../types/pixi/PixiGl2dResources';
import '../init';
import { Cache } from '~/assets/cache/Cache';
import { TextureSource } from '~/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { Sprite } from '~/scene/sprite/Sprite';
import { Spritesheet } from '~/spritesheet/Spritesheet';

function createTestSpritesheet(options: {
    label?: string;
    width?: number;
    height?: number;
    cachePrefix?: string;
    uri?: string;
} = {})
{
    const source = new TextureSource({
        width: options.width ?? 256,
        height: options.height ?? 256,
        label: options.label ?? 'atlas.png',
    });

    const texture = new Texture({ source });

    const sheet = new Spritesheet({
        texture,
        uri: options.uri ?? 'atlas.json',
        cachePrefix: options.cachePrefix,
        data: {
            frames: {
                'frame1.png': {
                    frame: { x: 0, y: 0, w: 64, h: 64 },
                    sourceSize: { w: 64, h: 64 },
                    spriteSourceSize: { x: 0, y: 0 },
                },
                'frame2.png': {
                    frame: { x: 64, y: 0, w: 64, h: 64 },
                    sourceSize: { w: 64, h: 64 },
                    spriteSourceSize: { x: 0, y: 0 },
                },
            },
            meta: { scale: '1' },
        },
    });

    sheet.parseSync();

    return { sheet, source };
}

describe('gl2d Spritesheet serialization', () =>
{
    afterEach(() =>
    {
        Cache.reset();
    });

    it('should serialize spritesheet resource with type, uri, and source ref', () =>
    {
        const { sheet } = createTestSpritesheet({ uri: 'sprites.json' });

        // Put spritesheet in Cache so findSpritesheetForSource can find it
        Cache.set('sprites.json', sheet);

        const texture = sheet.textures['frame1.png'];
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const spritesheetResources = file.resources.filter(
            (r) => r.type === 'spritesheet',
        ) as Gl2dPixiSpritesheetResource[];

        expect(spritesheetResources).toHaveLength(1);
        expect(spritesheetResources[0].type).toBe('spritesheet');
        expect(spritesheetResources[0].uri).toBe('sprites.json');
        expect(typeof spritesheetResources[0].source).toBe('number');
    });

    it('should serialize cachePrefix as pixi_spritesheet extension', () =>
    {
        const { sheet } = createTestSpritesheet({ cachePrefix: 'myPrefix_', uri: 'prefixed.json' });

        Cache.set('prefixed.json', sheet);

        const texture = sheet.textures['frame1.png'];
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const spritesheetResources = file.resources.filter(
            (r) => r.type === 'spritesheet',
        ) as Gl2dPixiSpritesheetResource[];

        expect(spritesheetResources).toHaveLength(1);
        expect(spritesheetResources[0].extensions?.pixi_spritesheet).toBeDefined();
        expect(spritesheetResources[0].extensions.pixi_spritesheet.cachePrefix).toBe('myPrefix_');
        expect(file.extensionsUsed).toContain('pixi_spritesheet');
    });

    it('should deduplicate shared spritesheet across textures', () =>
    {
        const { sheet } = createTestSpritesheet({ uri: 'shared.json' });

        Cache.set('shared.json', sheet);

        const parent = new Container();

        parent.addChild(
            new Sprite(sheet.textures['frame1.png']),
            new Sprite(sheet.textures['frame2.png']),
        );

        const file = Gl2d.serialize(parent);

        const spritesheetResources = file.resources.filter(
            (r) => r.type === 'spritesheet',
        );

        expect(spritesheetResources).toHaveLength(1);
    });

    it('should set texture source to spritesheet ref instead of direct image_source', () =>
    {
        const { sheet } = createTestSpritesheet({ uri: 'indirect.json' });

        Cache.set('indirect.json', sheet);

        const texture = sheet.textures['frame1.png'];
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dPixiSpriteNode;
        const texResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

        // Source should point to the spritesheet resource, not directly to texture_source
        const sourceResource = file.resources[texResource.source as number];

        expect(sourceResource.type).toBe('spritesheet');
    });

    it('should set frameName on texture resource for spritesheet textures', () =>
    {
        const { sheet } = createTestSpritesheet({ uri: 'named.json' });

        Cache.set('named.json', sheet);

        const texture = sheet.textures['frame1.png'];
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dPixiSpriteNode;
        const texResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

        expect(texResource.frameName).toBe('frame1.png');
    });
});
