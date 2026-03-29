import '~/accessibility/init';
import '~/events/init';
import '~/rendering/init';
import { Gl2d } from '../Gl2d';
import { type Gl2dPixiNineSliceSpriteNode } from '../types/pixi/PixiGl2dNodes';
import { type Gl2dPixiImageSourceResource, type Gl2dPixiTextureResource } from '../types/pixi/PixiGl2dResources';
import '../init';
import { basePath } from '@test-utils';
import { Assets, loadTextures } from '~/assets';
import { extensions } from '~/extensions';
import { TextureSource } from '~/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { NineSliceSprite } from '~/scene/sprite-nine-slice/NineSliceSprite';

function createTestTexture(options: { label?: string; width?: number; height?: number } = {}): Texture
{
    const source = new TextureSource({
        width: options.width ?? 64,
        height: options.height ?? 64,
        label: options.label ?? 'test-texture.png',
    });

    return new Texture({ source });
}

describe('gl2d NineSliceSprite serialization', () =>
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

    it('should serialize a NineSliceSprite with correct type and texture', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture() });
        const file = Gl2d.serialize(nss);

        expect(file.nodes).toHaveLength(1);

        const node = file.nodes[0] as Gl2dPixiNineSliceSpriteNode;

        expect(node.type).toBe('nine_slice_sprite');
        expect(node.uid).toBeDefined();
        expect(node.texture).toBeDefined();
        expect(typeof node.texture).toBe('number');

        expect(file.resources).toBeDefined();
        expect(file.resources.length).toBeGreaterThanOrEqual(1);
    });

    it('should serialize a NineSliceSprite with a URL-loaded texture', async () =>
    {
        const texture = await Assets.load<Texture>('textures/bunny.png');
        const nss = new NineSliceSprite({ texture });
        const file = Gl2d.serialize(nss);

        const node = file.nodes[0] as Gl2dPixiNineSliceSpriteNode;

        expect(node.type).toBe('nine_slice_sprite');

        const textureResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

        expect(textureResource.type).toBe('texture');

        const imageSource = file.resources[textureResource.source as number] as Gl2dPixiImageSourceResource;

        expect(imageSource.type).toBe('image_source');
        expect(imageSource.uri).toContain('textures/bunny.png');
    });

    it('should always serialize width and height', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture(), width: 256, height: 128 });
        const file = Gl2d.serialize(nss);
        const node = file.nodes[0] as Gl2dPixiNineSliceSpriteNode;

        expect(node.width).toBe(256);
        expect(node.height).toBe(128);
    });

    it('should omit default border values', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture() });
        const file = Gl2d.serialize(nss);
        const node = file.nodes[0] as Gl2dPixiNineSliceSpriteNode;

        expect(node.leftWidth).toBeUndefined();
        expect(node.topHeight).toBeUndefined();
        expect(node.rightWidth).toBeUndefined();
        expect(node.bottomHeight).toBeUndefined();
    });

    it('should serialize non-default border values', () =>
    {
        const nss = new NineSliceSprite({
            texture: createTestTexture(),
            leftWidth: 20,
            topHeight: 15,
            rightWidth: 25,
            bottomHeight: 30,
        });

        const file = Gl2d.serialize(nss);
        const node = file.nodes[0] as Gl2dPixiNineSliceSpriteNode;

        expect(node.leftWidth).toBe(20);
        expect(node.topHeight).toBe(15);
        expect(node.rightWidth).toBe(25);
        expect(node.bottomHeight).toBe(30);
    });

    it('should omit default transform values', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture() });
        const file = Gl2d.serialize(nss);
        const node = file.nodes[0];

        expect(node.translation).toBeUndefined();
        expect(node.rotation).toBeUndefined();
        expect(node.scale).toBeUndefined();
        expect(node.alpha).toBeUndefined();
        expect(node.visible).toBeUndefined();
    });

    it('should serialize non-default transform values', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture() });

        nss.position.set(10, 20);
        nss.rotation = 1.5;
        nss.scale.set(2, 3);

        const file = Gl2d.serialize(nss);
        const node = file.nodes[0];

        expect(node.translation).toEqual([10, 20]);
        expect(node.rotation).toBe(1.5);
        expect(node.scale).toEqual([2, 3]);
    });

    it('should serialize non-default anchor via pixi_container_node', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture() });

        nss.anchor.set(0.5, 0.5);

        const file = Gl2d.serialize(nss);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext).toBeDefined();
        expect(ext.anchor).toEqual([0.5, 0.5]);
    });

    it('should serialize non-default tint via pixi_container_node', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture() });

        nss.tint = 0xff0000;

        const file = Gl2d.serialize(nss);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext).toBeDefined();
        expect(ext.tint).toBe('#ff0000');
    });

    it('should deduplicate shared textures', () =>
    {
        const texture = createTestTexture();
        const parent = new Container();
        const nssA = new NineSliceSprite({ texture });
        const nssB = new NineSliceSprite({ texture });

        parent.addChild(nssA, nssB);

        const file = Gl2d.serialize(parent);

        const nodeA = file.nodes[1] as Gl2dPixiNineSliceSpriteNode;
        const nodeB = file.nodes[2] as Gl2dPixiNineSliceSpriteNode;

        expect(nodeA.texture).toBe(nodeB.texture);
    });

    it('should not serialize children on NineSliceSprite', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture() });
        const file = Gl2d.serialize(nss);
        const node = file.nodes[0] as Gl2dPixiNineSliceSpriteNode;

        expect(node.children).toBeUndefined();
    });

    it('should serialize NineSliceSprite as child of Container', () =>
    {
        const parent = new Container();
        const nss = new NineSliceSprite({ texture: createTestTexture() });

        parent.addChild(nss);

        const file = Gl2d.serialize(parent);

        expect(file.nodes).toHaveLength(2);
        expect(file.nodes[0].type).toBe('container');
        expect(file.nodes[0].children).toEqual([1]);
        expect(file.nodes[1].type).toBe('nine_slice_sprite');
    });

    it('should serialize NineSliceSprite with mask', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture() });
        const maskContainer = new Container();

        nss.mask = maskContainer;

        const file = Gl2d.serialize(nss);
        const node = file.nodes[0] as Gl2dPixiNineSliceSpriteNode;

        expect(node.mask).toBeDefined();
        expect(typeof node.mask.node).toBe('number');
        expect(node.mask.inverse).toBe(false);
    });

    it('should return valid Gl2dFile structure', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture({ label: 'button.png' }) });

        nss.label = 'button';

        const file = Gl2d.serialize(nss);

        expect(file.asset.version).toBe('1.0');
        expect(file.asset.generator).toBe('pixi.js');
        expect(file.scene).toBe(0);
        expect(file.scenes).toHaveLength(1);
        expect(file.scenes[0].name).toBe('button');
        expect(file.scenes[0].nodes).toEqual([0]);
        expect(file.nodes.length).toBeGreaterThanOrEqual(1);
        expect(file.resources).toBeDefined();
    });

    it('should populate extensionsUsed for pixi_container_node', () =>
    {
        const nss = new NineSliceSprite({ texture: createTestTexture() });

        nss.anchor.set(0.5, 0.5);

        const file = Gl2d.serialize(nss);

        expect(file.extensionsUsed).toContain('pixi_container_node');
    });
});
