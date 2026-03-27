import '~/accessibility/init';
import '~/events/init';
import { Gl2d } from '../Gl2d';
import '../init';
import { VideoSource } from '~/rendering/renderers/shared/texture/sources/VideoSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { Sprite } from '~/scene/sprite/Sprite';

import type { Gl2dSpriteNode, Gl2dTextureResource, Gl2dVideoSourceResource } from '../Gl2dSchema';

function createTestVideoSource(options: {
    label?: string;
    width?: number;
    height?: number;
    loop?: boolean;
    muted?: boolean;
    playsinline?: boolean;
    crossorigin?: boolean | string;
    autoPlay?: boolean;
    autoLoad?: boolean;
    updateFPS?: number;
    preload?: boolean;
} = {})
{
    const video = document.createElement('video');

    return new VideoSource({
        resource: video,
        autoLoad: false,
        autoPlay: false,
        width: options.width ?? 64,
        height: options.height ?? 64,
        label: options.label ?? 'test-video.mp4',
        uri: options.label ?? 'test-video.mp4',
        ...options,
    });
}

describe('gl2d VideoSource serialization', () =>
{
    it('should serialize a VideoSource to video_source resource', () =>
    {
        const source = createTestVideoSource({ label: 'clip.mp4' });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource).toBeDefined();
        expect(videoResource.type).toBe('video_source');
        expect(videoResource.uid).toMatch(/^video_source_/);
        expect(videoResource.uri).toBe('clip.mp4');
    });

    it('should serialize non-default video properties', () =>
    {
        const source = createTestVideoSource({ label: 'clip.mp4', loop: true, muted: false });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.loop).toBe(true);
        expect(videoResource.muted).toBe(false);
    });

    it('should omit default video properties', () =>
    {
        const source = createTestVideoSource();
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.loop).toBeUndefined();
        expect(videoResource.muted).toBeUndefined();
        expect(videoResource.playsinline).toBeUndefined();
        expect(videoResource.crossorigin).toBeUndefined();
    });

    it('should deduplicate shared VideoSource across sprites', () =>
    {
        const source = createTestVideoSource({ label: 'shared.mp4' });
        const texture = new Texture({ source });
        const parent = new Container();

        parent.addChild(new Sprite(texture), new Sprite(texture));

        const file = Gl2d.serialize(parent);

        const videoResources = file.resources.filter(
            (r): r is Gl2dVideoSourceResource => (r as Gl2dVideoSourceResource).type === 'video_source',
        );

        expect(videoResources).toHaveLength(1);
    });

    it('should produce texture resource pointing to video_source', () =>
    {
        const source = createTestVideoSource({ label: 'intro.mp4', width: 320, height: 240 });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;

        expect(node.type).toBe('sprite');
        expect(typeof node.texture).toBe('number');

        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;

        expect(textureResource.type).toBe('texture');

        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.type).toBe('video_source');
        expect(videoResource.width).toBe(320);
        expect(videoResource.height).toBe(240);
    });

    it('should serialize crossorigin string value', () =>
    {
        const source = createTestVideoSource({ label: 'clip.mp4', crossorigin: 'anonymous' });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.crossorigin).toBe('anonymous');
    });

    it('should omit default autoLoad', () =>
    {
        const source = createTestVideoSource({ label: 'clip.mp4', autoLoad: true });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.autoLoad).toBeUndefined();
    });

    it('should serialize autoLoad=false as non-default', () =>
    {
        const source = createTestVideoSource({ label: 'clip.mp4' });
        // helper sets autoLoad: false, which differs from VIDEO_SOURCE_DEFAULTS.autoLoad (true)
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.autoLoad).toBe(false);
    });

    it('should serialize non-default autoPlay', () =>
    {
        const source = createTestVideoSource({ label: 'clip.mp4', autoPlay: true });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        // autoPlay: true is the default in VIDEO_SOURCE_DEFAULTS, so it should be omitted
        // BUT the helper sets autoPlay: false by default, so autoPlay: true overrides that
        // The serializer checks source['autoPlay'] against VIDEO_SOURCE_DEFAULTS.autoPlay (true)
        // So if source has autoPlay=true, it matches default and is omitted
        expect(videoResource.autoPlay).toBeUndefined();
    });

    it('should serialize autoPlay=false as non-default', () =>
    {
        const source = createTestVideoSource({ label: 'clip.mp4' });
        // helper sets autoPlay: false, which differs from VIDEO_SOURCE_DEFAULTS.autoPlay (true)
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.autoPlay).toBe(false);
    });

    it('should serialize non-default fps', () =>
    {
        const source = createTestVideoSource({ label: 'clip.mp4', updateFPS: 30 });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.fps).toBe(30);
    });

    it('should omit default fps', () =>
    {
        const source = createTestVideoSource();
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.fps).toBeUndefined();
    });

    it('should serialize non-default preload', () =>
    {
        const source = createTestVideoSource({ label: 'clip.mp4', preload: true });
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.preload).toBe(true);
    });

    it('should omit default preload', () =>
    {
        const source = createTestVideoSource();
        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        const file = Gl2d.serialize(sprite);

        const node = file.nodes[0] as Gl2dSpriteNode;
        const textureResource = file.resources[node.texture as number] as Gl2dTextureResource;
        const videoResource = file.resources[textureResource.source as number] as Gl2dVideoSourceResource;

        expect(videoResource.preload).toBeUndefined();
    });
});
