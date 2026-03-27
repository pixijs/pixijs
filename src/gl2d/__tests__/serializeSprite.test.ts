import '~/accessibility/init';
import '~/events/init';
import '~/rendering/init';
import { Gl2d } from '../Gl2d';
import { type Gl2dPixiSpriteNode } from '../types/pixi/PixiGl2dNodes';
import { type Gl2dPixiImageSourceResource, type Gl2dPixiTextureResource } from '../types/pixi/PixiGl2dResources';
import '../init';
import { basePath } from '@test-utils';
import { Assets, loadTextures } from '~/assets';
import { extensions } from '~/extensions';
import { Rectangle } from '~/maths/shapes/Rectangle';
import { TextureSource } from '~/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { Sprite } from '~/scene/sprite/Sprite';

function createTestTexture(options: { label?: string; width?: number; height?: number } = {}): Texture
{
    const source = new TextureSource({
        width: options.width ?? 64,
        height: options.height ?? 64,
        label: options.label ?? 'test-texture.png',
    });

    return new Texture({ source });
}

describe('gl2d Sprite serialization', () =>
{
    extensions.add(loadTextures);

    beforeAll(async () =>
    {
        await Assets.init({
            basePath,
        });
    });

    afterAll(() =>
    {
        Assets.reset();
    });

    it('should serialize a Sprite with Texture.EMPTY', () =>
    {
        const sprite = new Sprite();
        const file = Gl2d.serialize(sprite);

        expect(file.nodes).toHaveLength(1);

        const node = file.nodes[0] as Gl2dPixiSpriteNode;

        expect(node.type).toBe('sprite');
        expect(node.uid).toBeDefined();
        expect(node.texture).toBeDefined();
        expect(typeof node.texture).toBe('number');

        expect(file.resources).toBeDefined();
        expect(file.resources.length).toBeGreaterThanOrEqual(1);
    });

    it('should serialize a Sprite with a URL-loaded texture', async () =>
    {
        const texture = await Assets.load<Texture>('textures/bunny.png');
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dPixiSpriteNode;

        expect(node.type).toBe('sprite');

        const textureResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

        expect(textureResource.type).toBe('texture');

        const imageSource = file.resources[textureResource.source as number] as Gl2dPixiImageSourceResource;

        expect(imageSource.type).toBe('image_source');
        expect(imageSource.uri).toContain('textures/bunny.png');
        expect(imageSource.width).toBe(texture.source.width);
        expect(imageSource.height).toBe(texture.source.height);
    });

    it('should serialize non-default transform values', () =>
    {
        const sprite = new Sprite(createTestTexture());

        sprite.position.set(10, 20);
        sprite.rotation = 1.5;
        sprite.scale.set(2, 3);

        const file = Gl2d.serialize(sprite);
        const node = file.nodes[0];

        expect(node.translation).toEqual([10, 20]);
        expect(node.rotation).toBe(1.5);
        expect(node.scale).toEqual([2, 3]);
    });

    it('should omit default transform values', () =>
    {
        const sprite = new Sprite(createTestTexture());
        const file = Gl2d.serialize(sprite);
        const node = file.nodes[0];

        expect(node.translation).toBeUndefined();
        expect(node.rotation).toBeUndefined();
        expect(node.scale).toBeUndefined();
        expect(node.alpha).toBeUndefined();
        expect(node.visible).toBeUndefined();
    });

    it('should serialize non-default anchor', () =>
    {
        const sprite = new Sprite(createTestTexture());

        sprite.anchor.set(0.5, 0.5);

        const file = Gl2d.serialize(sprite);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext).toBeDefined();
        expect(ext.anchor).toEqual([0.5, 0.5]);
    });

    it('should serialize non-default tint', () =>
    {
        const sprite = new Sprite(createTestTexture());

        sprite.tint = 0xff0000;

        const file = Gl2d.serialize(sprite);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext).toBeDefined();
        expect(ext.tint).toBe('#ff0000');
    });

    it('should serialize alpha and visible', () =>
    {
        const sprite = new Sprite(createTestTexture());

        sprite.alpha = 0.5;
        sprite.visible = false;

        const file = Gl2d.serialize(sprite);
        const node = file.nodes[0];

        expect(node.alpha).toBe(0.5);
        expect(node.visible).toBe(false);
    });

    it('should serialize width/height from texture dimensions', () =>
    {
        const sprite = new Sprite(createTestTexture({ width: 64, height: 64 }));
        const file = Gl2d.serialize(sprite);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.width).toBe(64);
        expect(ext.height).toBe(64);
    });

    it('should serialize width/height for Texture.EMPTY as 1x1', () =>
    {
        const sprite = new Sprite();
        const file = Gl2d.serialize(sprite);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.width).toBe(1);
        expect(ext.height).toBe(1);
    });

    it('should serialize roundPixels', () =>
    {
        const sprite = new Sprite({ texture: createTestTexture(), roundPixels: true });
        const file = Gl2d.serialize(sprite);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext).toBeDefined();
        expect(ext.roundPixels).toBe(true);
    });

    it('should deduplicate shared textures', async () =>
    {
        const texture = await Assets.load<Texture>('textures/bunny.png');
        const parent = new Container();
        const spriteA = new Sprite(texture);
        const spriteB = new Sprite(texture);

        parent.addChild(spriteA, spriteB);

        const file = Gl2d.serialize(parent);

        const nodeA = file.nodes[1] as Gl2dPixiSpriteNode;
        const nodeB = file.nodes[2] as Gl2dPixiSpriteNode;

        expect(nodeA.texture).toBe(nodeB.texture);

        const textureResources = file.resources.filter((r) => r.type === 'texture');
        const imageResources = file.resources.filter((r) => r.type === 'image_source');

        expect(textureResources).toHaveLength(1);
        expect(imageResources).toHaveLength(1);
    });

    it('should deduplicate shared texture source across different textures', async () =>
    {
        const loaded = await Assets.load<Texture>('textures/bunny.png');
        const textureA = new Texture({
            source: loaded.source,
            frame: new Rectangle(0, 0, 13, 13),
        });
        const textureB = new Texture({
            source: loaded.source,
            frame: new Rectangle(13, 0, 13, 13),
        });

        const parent = new Container();

        parent.addChild(new Sprite(textureA), new Sprite(textureB));

        const file = Gl2d.serialize(parent);

        const textureResources = file.resources.filter((r) => r.type === 'texture');
        const imageResources = file.resources.filter((r) => r.type === 'image_source');

        expect(textureResources).toHaveLength(2);
        expect(imageResources).toHaveLength(1);

        const texResA = textureResources[0] as Gl2dPixiTextureResource;
        const texResB = textureResources[1] as Gl2dPixiTextureResource;

        expect(texResA.source).toBe(texResB.source);
    });

    it('should serialize texture frame when not full source', () =>
    {
        const source = new TextureSource({ width: 256, height: 256, label: 'atlas.png' });
        const texture = new Texture({
            source,
            frame: new Rectangle(10, 20, 50, 60),
        });

        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dPixiSpriteNode;
        const texResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

        expect(texResource.frame).toEqual([10, 20, 50, 60]);
    });

    it('should omit frame when texture covers full source', () =>
    {
        const texture = createTestTexture({ label: 'full.png', width: 64, height: 64 });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dPixiSpriteNode;
        const texResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

        expect(texResource.frame).toBeUndefined();
    });

    it('should serialize pixi_texture_resource extension for non-default values', () =>
    {
        const source = new TextureSource({ width: 100, height: 100, label: 'test.png' });
        const texture = new Texture({
            source,
            orig: new Rectangle(0, 0, 80, 80),
            trim: new Rectangle(5, 5, 70, 70),
            rotate: 2,
            dynamic: true,
            defaultAnchor: { x: 0.5, y: 0.5 },
        });

        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dPixiSpriteNode;
        const texResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;
        const ext = texResource.extensions?.pixi_texture_resource;

        expect(ext).toBeDefined();
        expect(ext.orig).toEqual([0, 0, 80, 80]);
        expect(ext.trim).toEqual([5, 5, 70, 70]);
        expect(ext.rotate).toBe(2);
        expect(ext.dynamic).toBe(true);
        expect(ext.defaultAnchor).toEqual([0.5, 0.5]);
    });

    it('should populate extensionsUsed for pixi_container_node', () =>
    {
        const sprite = new Sprite(createTestTexture());

        sprite.tint = 0xff0000;

        const file = Gl2d.serialize(sprite);

        expect(file.extensionsUsed).toContain('pixi_container_node');
    });

    it('should include resources in Gl2dFile output', () =>
    {
        const sprite = new Sprite(createTestTexture());
        const file = Gl2d.serialize(sprite);

        expect(file.resources).toBeDefined();
        expect(file.resources.length).toBeGreaterThanOrEqual(2);
    });

    it('should serialize Sprite as child of Container', () =>
    {
        const parent = new Container();
        const sprite = new Sprite(createTestTexture());

        parent.addChild(sprite);

        const file = Gl2d.serialize(parent);

        expect(file.nodes).toHaveLength(2);
        expect(file.nodes[0].type).toBe('container');
        expect(file.nodes[0].children).toEqual([1]);
        expect(file.nodes[1].type).toBe('sprite');
    });

    it('should not serialize children on Sprite', () =>
    {
        const sprite = new Sprite(createTestTexture());
        const file = Gl2d.serialize(sprite);
        const node = file.nodes[0] as Gl2dPixiSpriteNode;

        expect(node.children).toBeUndefined();
    });

    it('should serialize sprite without mask when mask not set', () =>
    {
        const sprite = new Sprite(createTestTexture());
        const file = Gl2d.serialize(sprite);
        const node = file.nodes[0] as Gl2dPixiSpriteNode;

        expect(node.mask).toBeUndefined();
    });

    it('should return valid Gl2dFile structure', () =>
    {
        const sprite = new Sprite(createTestTexture({ label: 'hero.png' }));

        sprite.label = 'hero';

        const file = Gl2d.serialize(sprite);

        expect(file.asset.version).toBe('1.0');
        expect(file.asset.generator).toBe('pixi.js');
        expect(file.scene).toBe(0);
        expect(file.scenes).toHaveLength(1);
        expect(file.scenes[0].name).toBe('hero');
        expect(file.scenes[0].nodes).toEqual([0]);
        expect(file.nodes.length).toBeGreaterThanOrEqual(1);
        expect(file.resources).toBeDefined();
    });

    it('should serialize sprite with mask', () =>
    {
        const sprite = new Sprite(createTestTexture());
        const maskContainer = new Container();

        sprite.mask = maskContainer;

        const file = Gl2d.serialize(sprite);
        const node = file.nodes[0] as Gl2dPixiSpriteNode;

        expect(node.mask).toBeDefined();
        expect(typeof node.mask.node).toBe('number');
        expect(node.mask.inverse).toBe(false);
    });

    it('should serialize defaultBorders in pixi_texture_resource extension', () =>
    {
        const source = new TextureSource({ width: 100, height: 100, label: 'btn.png' });
        const texture = new Texture({
            source,
            defaultBorders: { left: 10, top: 15, right: 20, bottom: 25 },
        });

        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dPixiSpriteNode;
        const texResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;
        const ext = texResource.extensions?.pixi_texture_resource;

        expect(ext).toBeDefined();
        expect(ext.defaultBorders).toEqual([10, 15, 20, 25]);
    });
});
