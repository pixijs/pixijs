import { Gl2d } from '../Gl2d';
import '../init';
import { BufferImageSource } from '~/rendering/renderers/shared/texture/sources/BufferImageSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { Sprite } from '~/scene/sprite/Sprite';

import type { Gl2dPixiSpriteNode as Gl2dSpriteNode } from '../types/pixi/PixiGl2dNodes';
import type {
    Gl2dPixiBufferImageSourceResource,
    Gl2dPixiTextureResource,
} from '../types/pixi/PixiGl2dResources';

function getBufferSourceResource(file: ReturnType<typeof Gl2d.serialize>)
{
    const node = file.nodes[0] as Gl2dSpriteNode;
    const textureResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

    return file.resources[textureResource.source as number] as Gl2dPixiBufferImageSourceResource;
}

describe('gl2d BufferImageSource serialization', () =>
{
    it('should serialize a BufferImageSource to buffer_image_source resource', () =>
    {
        const source = new BufferImageSource({ width: 64, height: 64 });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getBufferSourceResource(file);

        expect(resource).toBeDefined();
        expect(resource.type).toBe('buffer_image_source');
        expect(resource.uid).toMatch(/^buffer_image_source_/);
    });

    it('should serialize width and height', () =>
    {
        const source = new BufferImageSource({ width: 128, height: 256 });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getBufferSourceResource(file);

        expect(resource.width).toBe(128);
        expect(resource.height).toBe(256);
    });

    it('should auto-detect rgba32float format for Float32Array', () =>
    {
        const source = new BufferImageSource({
            resource: new Float32Array(16 * 16 * 4),
            width: 16,
            height: 16,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getBufferSourceResource(file);

        expect(resource.format).toBe('rgba32float');
    });

    it('should serialize buffer data as uri number array', () =>
    {
        const data = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255]);
        const source = new BufferImageSource({
            resource: data,
            width: 2,
            height: 1,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getBufferSourceResource(file);

        expect(resource.uri).toEqual([255, 0, 0, 255, 0, 255, 0, 255]);
    });

    it('should serialize Float32Array uri with float values', () =>
    {
        const data = new Float32Array([1.0, 0.5, 0.0, 1.0, 0.0, 0.0, 0.25, 0.75]);
        const source = new BufferImageSource({
            resource: data,
            width: 2,
            height: 1,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getBufferSourceResource(file);

        expect(resource.uri).toEqual([1.0, 0.5, 0.0, 1.0, 0.0, 0.0, 0.25, 0.75]);
    });

    it('should serialize Int32Array uri values', () =>
    {
        const data = new Int32Array([100, -200, 300, 255]);
        const source = new BufferImageSource({
            resource: data,
            width: 1,
            height: 1,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getBufferSourceResource(file);

        expect(resource.uri).toEqual([100, -200, 300, 255]);
    });

    it('should serialize Uint16Array uri values', () =>
    {
        const data = new Uint16Array([65535, 0, 32768, 1]);
        const source = new BufferImageSource({
            resource: data,
            width: 1,
            height: 1,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getBufferSourceResource(file);

        expect(resource.uri).toEqual([65535, 0, 32768, 1]);
    });

    it('should auto-detect bgra8unorm format for Uint8Array', () =>
    {
        const source = new BufferImageSource({
            resource: new Uint8Array(16 * 16 * 4),
            width: 16,
            height: 16,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getBufferSourceResource(file);

        // bgra8unorm is the default format, so it should be omitted
        expect(resource.format).toBeUndefined();
    });

    it('should deduplicate shared BufferImageSource across sprites', () =>
    {
        const source = new BufferImageSource({ width: 32, height: 32 });
        const texture = new Texture({ source });
        const parent = new Container();

        parent.addChild(new Sprite(texture), new Sprite(texture));

        const file = Gl2d.serialize(parent);

        const bufferResources = file.resources.filter(
            (r): r is Gl2dPixiBufferImageSourceResource =>
                (r as Gl2dPixiBufferImageSourceResource).type === 'buffer_image_source',
        );

        expect(bufferResources).toHaveLength(1);
    });

    it('should produce texture resource pointing to buffer_image_source', () =>
    {
        const source = new BufferImageSource({ width: 64, height: 64 });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;

        expect(node.type).toBe('sprite');
        expect(typeof node.texture).toBe('number');

        const textureResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

        expect(textureResource.type).toBe('texture');

        const bufferResource = file.resources[textureResource.source as number] as Gl2dPixiBufferImageSourceResource;

        expect(bufferResource.type).toBe('buffer_image_source');
    });

    it('should serialize non-default format', () =>
    {
        const source = new BufferImageSource({
            resource: new Uint16Array(16 * 16 * 4),
            width: 16,
            height: 16,
        });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getBufferSourceResource(file);

        expect(resource.format).toBe('rgba16uint');
    });

    it('should omit default properties', () =>
    {
        const source = new BufferImageSource({ width: 1, height: 1 });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const resource = getBufferSourceResource(file);

        // width=1, height=1 are defaults, should be omitted
        expect(resource.width).toBeUndefined();
        expect(resource.height).toBeUndefined();
    });
});
