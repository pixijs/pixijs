import '~/accessibility/init';
import '~/events/init';
import '~/rendering/init';
import { Gl2d } from '../Gl2d';
import { type Gl2dPixiTilingSpriteNode } from '../types/pixi/PixiGl2dNodes';
import { type Gl2dPixiImageSourceResource, type Gl2dPixiTextureResource } from '../types/pixi/PixiGl2dResources';
import '../init';
import { basePath } from '@test-utils';
import { Assets, loadTextures } from '~/assets';
import { extensions } from '~/extensions';
import { TextureSource } from '~/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { TilingSprite } from '~/scene/sprite-tiling/TilingSprite';

function createTestTexture(options: { label?: string; width?: number; height?: number } = {}): Texture
{
    const source = new TextureSource({
        width: options.width ?? 64,
        height: options.height ?? 64,
        label: options.label ?? 'test-texture.png',
    });

    return new Texture({ source });
}

describe('gl2d TilingSprite serialization', () =>
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

    it('should serialize a TilingSprite with correct type and texture', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 200, height: 100 });
        const file = Gl2d.serialize(ts);

        expect(file.nodes).toHaveLength(1);

        const node = file.nodes[0] as Gl2dPixiTilingSpriteNode;

        expect(node.type).toBe('tiling_sprite');
        expect(node.uid).toBeDefined();
        expect(node.texture).toBeDefined();
        expect(typeof node.texture).toBe('number');

        expect(file.resources).toBeDefined();
        expect(file.resources.length).toBeGreaterThanOrEqual(1);
    });

    it('should serialize a TilingSprite with a URL-loaded texture', async () =>
    {
        const texture = await Assets.load<Texture>('textures/bunny.png');
        const ts = new TilingSprite({ texture, width: 400, height: 300 });
        const file = Gl2d.serialize(ts);

        const node = file.nodes[0] as Gl2dPixiTilingSpriteNode;

        expect(node.type).toBe('tiling_sprite');

        const textureResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

        expect(textureResource.type).toBe('texture');

        const imageSource = file.resources[textureResource.source as number] as Gl2dPixiImageSourceResource;

        expect(imageSource.type).toBe('image_source');
        expect(imageSource.uri).toContain('textures/bunny.png');
    });

    it('should always serialize width and height', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 256, height: 128 });
        const file = Gl2d.serialize(ts);
        const node = file.nodes[0] as Gl2dPixiTilingSpriteNode;

        expect(node.width).toBe(256);
        expect(node.height).toBe(128);
    });

    it('should omit default tiling values', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 100, height: 100 });
        const file = Gl2d.serialize(ts);
        const node = file.nodes[0] as Gl2dPixiTilingSpriteNode;

        expect(node.tileScale).toBeUndefined();
        expect(node.tilePosition).toBeUndefined();
        expect(node.tileRotation).toBeUndefined();
    });

    it('should serialize non-default tiling values', () =>
    {
        const ts = new TilingSprite({
            texture: createTestTexture(),
            width: 100,
            height: 100,
            tileScale: { x: 2, y: 3 },
            tilePosition: { x: 10, y: 20 },
            tileRotation: 0.5,
        });

        const file = Gl2d.serialize(ts);
        const node = file.nodes[0] as Gl2dPixiTilingSpriteNode;

        expect(node.tileScale).toEqual([2, 3]);
        expect(node.tilePosition).toEqual([10, 20]);
        expect(node.tileRotation).toBe(0.5);
    });

    it('should omit default pixi_tiling_sprite_node extension', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 100, height: 100 });
        const file = Gl2d.serialize(ts);
        const node = file.nodes[0] as Gl2dPixiTilingSpriteNode;

        expect(node.extensions?.pixi_tiling_sprite_node).toBeUndefined();
    });

    it('should serialize non-default applyAnchorToTexture', () =>
    {
        const ts = new TilingSprite({
            texture: createTestTexture(),
            width: 100,
            height: 100,
            applyAnchorToTexture: true,
        });

        const file = Gl2d.serialize(ts);
        const ext = (file.nodes[0] as Gl2dPixiTilingSpriteNode).extensions?.pixi_tiling_sprite_node;

        expect(ext).toBeDefined();
        expect(ext.applyAnchorToTexture).toBe(true);
    });

    it('should serialize non-default clampMargin', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 100, height: 100 });

        ts.clampMargin = -0.5;

        const file = Gl2d.serialize(ts);
        const ext = (file.nodes[0] as Gl2dPixiTilingSpriteNode).extensions?.pixi_tiling_sprite_node;

        expect(ext).toBeDefined();
        expect(ext.clampMargin).toBe(-0.5);
    });

    it('should populate extensionsUsed for pixi_tiling_sprite_node', () =>
    {
        const ts = new TilingSprite({
            texture: createTestTexture(),
            width: 100,
            height: 100,
            applyAnchorToTexture: true,
        });

        const file = Gl2d.serialize(ts);

        expect(file.extensionsUsed).toContain('pixi_tiling_sprite_node');
    });

    it('should serialize non-default transform values', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 100, height: 100 });

        ts.position.set(10, 20);
        ts.rotation = 1.5;
        ts.scale.set(2, 3);

        const file = Gl2d.serialize(ts);
        const node = file.nodes[0];

        expect(node.translation).toEqual([10, 20]);
        expect(node.rotation).toBe(1.5);
        expect(node.scale).toEqual([2, 3]);
    });

    it('should omit default transform values', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 100, height: 100 });
        const file = Gl2d.serialize(ts);
        const node = file.nodes[0];

        expect(node.translation).toBeUndefined();
        expect(node.rotation).toBeUndefined();
        expect(node.scale).toBeUndefined();
        expect(node.alpha).toBeUndefined();
        expect(node.visible).toBeUndefined();
    });

    it('should serialize non-default anchor via pixi_container_node', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 100, height: 100 });

        ts.anchor.set(0.5, 0.5);

        const file = Gl2d.serialize(ts);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext).toBeDefined();
        expect(ext.anchor).toEqual([0.5, 0.5]);
    });

    it('should serialize non-default tint via pixi_container_node', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 100, height: 100 });

        ts.tint = 0xff0000;

        const file = Gl2d.serialize(ts);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext).toBeDefined();
        expect(ext.tint).toBe('#ff0000');
    });

    it('should deduplicate shared textures', () =>
    {
        const texture = createTestTexture();
        const parent = new Container();
        const tsA = new TilingSprite({ texture, width: 100, height: 100 });
        const tsB = new TilingSprite({ texture, width: 200, height: 200 });

        parent.addChild(tsA, tsB);

        const file = Gl2d.serialize(parent);

        const nodeA = file.nodes[1] as Gl2dPixiTilingSpriteNode;
        const nodeB = file.nodes[2] as Gl2dPixiTilingSpriteNode;

        expect(nodeA.texture).toBe(nodeB.texture);
    });

    it('should not serialize children on TilingSprite', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 100, height: 100 });
        const file = Gl2d.serialize(ts);
        const node = file.nodes[0] as Gl2dPixiTilingSpriteNode;

        expect(node.children).toBeUndefined();
    });

    it('should serialize TilingSprite as child of Container', () =>
    {
        const parent = new Container();
        const ts = new TilingSprite({ texture: createTestTexture(), width: 100, height: 100 });

        parent.addChild(ts);

        const file = Gl2d.serialize(parent);

        expect(file.nodes).toHaveLength(2);
        expect(file.nodes[0].type).toBe('container');
        expect(file.nodes[0].children).toEqual([1]);
        expect(file.nodes[1].type).toBe('tiling_sprite');
    });

    it('should serialize TilingSprite with mask', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture(), width: 100, height: 100 });
        const maskContainer = new Container();

        ts.mask = maskContainer;

        const file = Gl2d.serialize(ts);
        const node = file.nodes[0] as Gl2dPixiTilingSpriteNode;

        expect(node.mask).toBeDefined();
        expect(typeof node.mask.node).toBe('number');
        expect(node.mask.inverse).toBe(false);
    });

    it('should return valid Gl2dFile structure', () =>
    {
        const ts = new TilingSprite({ texture: createTestTexture({ label: 'bg.png' }), width: 800, height: 600 });

        ts.label = 'background';

        const file = Gl2d.serialize(ts);

        expect(file.asset.version).toBe('1.0');
        expect(file.asset.generator).toBe('pixi.js');
        expect(file.scene).toBe(0);
        expect(file.scenes).toHaveLength(1);
        expect(file.scenes[0].name).toBe('background');
        expect(file.scenes[0].nodes).toEqual([0]);
        expect(file.nodes.length).toBeGreaterThanOrEqual(1);
        expect(file.resources).toBeDefined();
    });
});
