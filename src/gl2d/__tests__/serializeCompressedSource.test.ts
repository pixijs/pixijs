import { Gl2d } from '../Gl2d';
import '../init';
import { CompressedSource } from '~/rendering/renderers/shared/texture/sources/CompressedSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { Sprite } from '~/scene/sprite/Sprite';

import type { Gl2dPixiSpriteNode as Gl2dSpriteNode } from '../types/pixi/PixiGl2dNodes';
import type {
    Gl2dPixiCompressedSourceResource,
    Gl2dPixiTextureResource,
} from '../types/pixi/PixiGl2dResources';

function getCompressedSourceResource(file: ReturnType<typeof Gl2d.serialize>)
{
    const node = file.nodes[0] as Gl2dSpriteNode;
    const textureResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

    return file.resources[textureResource.source as number] as Gl2dPixiCompressedSourceResource;
}

describe('gl2d CompressedSource serialization', () =>
{
    it('should serialize a CompressedSource to compressed_source resource', () =>
    {
        const source = new CompressedSource({
            resource: [new Uint8Array(64)],
            width: 64,
            height: 64,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getCompressedSourceResource(file);

        expect(resource).toBeDefined();
        expect(resource.type).toBe('compressed_source');
        expect(resource.uid).toMatch(/^compressed_source_/);
    });

    it('should serialize width and height', () =>
    {
        const source = new CompressedSource({
            resource: [new Uint8Array(128)],
            width: 128,
            height: 256,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getCompressedSourceResource(file);

        expect(resource.width).toBe(128);
        expect(resource.height).toBe(256);
    });

    it('should serialize compressed format', () =>
    {
        const source = new CompressedSource({
            resource: [new Uint8Array(64)],
            width: 64,
            height: 64,
            format: 'bc3-rgba-unorm',
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getCompressedSourceResource(file);

        expect(resource.format).toBe('bc3-rgba-unorm');
    });

    it('should serialize mipLevelCount in pixi extension when multiple mip levels', () =>
    {
        const source = new CompressedSource({
            resource: [new Uint8Array(64), new Uint8Array(16), new Uint8Array(4)],
            width: 64,
            height: 64,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getCompressedSourceResource(file);

        expect(resource.extensions?.pixi_texture_source_resource?.mipLevelCount).toBe(3);
    });

    it('should deduplicate shared CompressedSource across sprites', () =>
    {
        const source = new CompressedSource({
            resource: [new Uint8Array(64)],
            width: 64,
            height: 64,
        });
        const texture = new Texture({ source });
        const parent = new Container();

        parent.addChild(new Sprite(texture), new Sprite(texture));

        const file = Gl2d.serialize(parent);

        const compressedResources = file.resources.filter(
            (r): r is Gl2dPixiCompressedSourceResource =>
                (r as Gl2dPixiCompressedSourceResource).type === 'compressed_source',
        );

        expect(compressedResources).toHaveLength(1);
    });

    it('should produce texture resource pointing to compressed_source', () =>
    {
        const source = new CompressedSource({
            resource: [new Uint8Array(64)],
            width: 64,
            height: 64,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;

        expect(node.type).toBe('sprite');
        expect(typeof node.texture).toBe('number');

        const textureResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

        expect(textureResource.type).toBe('texture');

        const compressedResource = file.resources[textureResource.source as number] as Gl2dPixiCompressedSourceResource;

        expect(compressedResource.type).toBe('compressed_source');
    });

    it('should omit default properties', () =>
    {
        const source = new CompressedSource({
            resource: [new Uint8Array(1)],
            width: 1,
            height: 1,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getCompressedSourceResource(file);

        expect(resource.width).toBeUndefined();
        expect(resource.height).toBeUndefined();
    });
});
