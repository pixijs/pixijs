import '~/accessibility/init';
import '~/events/init';
import { Gl2d } from '../Gl2d';
import { type Gl2dPixiTextureResource, type Gl2dPixiTextureSourceResource } from '../types/pixi/PixiGl2dResources';
import '../init';
import { TextureSource } from '~/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Sprite } from '~/scene/sprite/Sprite';

function getTextureSourceResource(file: ReturnType<typeof Gl2d.serialize>): Gl2dPixiTextureSourceResource
{
    const node = file.nodes[0] as any;
    const textureResource = file.resources[node.texture as number] as Gl2dPixiTextureResource;

    return file.resources[textureResource.source as number] as unknown as Gl2dPixiTextureSourceResource;
}

describe('gl2d TextureSource serialization', () =>
{
    it('should serialize non-default resolution', () =>
    {
        const source = new TextureSource({ width: 64, height: 64, label: 'test.png', resolution: 2 });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        const sourceResource = getTextureSourceResource(file);

        expect(sourceResource.resolution).toBe(2);
    });

    it('should omit default resolution', () =>
    {
        const source = new TextureSource({ width: 64, height: 64, label: 'test.png', resolution: 1 });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        const sourceResource = getTextureSourceResource(file);

        expect(sourceResource.resolution).toBeUndefined();
    });

    it('should serialize non-default antialias', () =>
    {
        const source = new TextureSource({ width: 64, height: 64, label: 'test.png', antialias: true });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        const sourceResource = getTextureSourceResource(file);

        expect(sourceResource.antialias).toBe(true);
    });

    it('should serialize non-default scaleMode', () =>
    {
        const source = new TextureSource({
            width: 64, height: 64, label: 'test.png',
            scaleMode: 'nearest',
        });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        const sourceResource = getTextureSourceResource(file);

        expect(sourceResource.scaleMode).toBe('nearest');
    });

    it('should map clamp-to-edge addressMode to clamp', () =>
    {
        const source = new TextureSource({
            width: 64, height: 64, label: 'test.png',
            addressMode: 'clamp-to-edge',
        });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        const sourceResource = getTextureSourceResource(file);

        // 'clamp' is the default, so it should be omitted
        expect(sourceResource.addressMode).toBeUndefined();
    });

    it('should map repeat addressMode to repeat', () =>
    {
        const source = new TextureSource({
            width: 64, height: 64, label: 'test.png',
            addressMode: 'repeat',
        });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        const sourceResource = getTextureSourceResource(file);

        expect(sourceResource.addressMode).toBe('repeat');
    });

    it('should map mirror-repeat addressMode to mirror', () =>
    {
        const source = new TextureSource({
            width: 64, height: 64, label: 'test.png',
            addressMode: 'mirror-repeat',
        });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        const sourceResource = getTextureSourceResource(file);

        expect(sourceResource.addressMode).toBe('mirror');
    });

    it('should serialize pixi_texture_source_resource extension for non-default autoGenerateMipmaps', () =>
    {
        const source = new TextureSource({
            width: 64, height: 64, label: 'test.png',
            autoGenerateMipmaps: true,
        });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        const sourceResource = getTextureSourceResource(file);
        const ext = sourceResource.extensions?.pixi_texture_source_resource;

        expect(ext).toBeDefined();
        expect(ext.autoGenerateMipmaps).toBe(true);
    });

    it('should serialize non-default minFilter in extension', () =>
    {
        const source = new TextureSource({
            width: 64, height: 64, label: 'test.png',
            minFilter: 'nearest',
        });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        const sourceResource = getTextureSourceResource(file);
        const ext = sourceResource.extensions?.pixi_texture_source_resource;

        expect(ext).toBeDefined();
        expect(ext.minFilter).toBe('nearest');
    });

    it('should omit pixi_texture_source_resource extension properties that match defaults', () =>
    {
        const source = new TextureSource({ width: 64, height: 64, label: 'test.png' });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        const sourceResource = getTextureSourceResource(file);
        const ext = sourceResource.extensions?.pixi_texture_source_resource;

        // magFilter, minFilter, mipmapFilter default to 'linear' in both PixiJS and gl2d
        expect(ext?.magFilter).toBeUndefined();
        expect(ext?.minFilter).toBeUndefined();
        expect(ext?.mipmapFilter).toBeUndefined();
    });

    it('should populate extensionsUsed for pixi_texture_source_resource', () =>
    {
        const source = new TextureSource({
            width: 64, height: 64, label: 'test.png',
            autoGenerateMipmaps: true,
        });
        const sprite = new Sprite(new Texture({ source }));
        const file = Gl2d.serialize(sprite);

        expect(file.extensionsUsed).toContain('pixi_texture_source_resource');
    });
});
