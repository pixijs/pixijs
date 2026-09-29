import { getTextureBatchBindGroup } from '../gpu/getTextureBatchBindGroup';
import { describeLocalOnly, getTexture, getWebGPURenderer } from '@test-utils';
import { RenderTexture } from '~/rendering/renderers/shared/texture/RenderTexture';
import { TextureSource } from '~/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { Graphics } from '~/scene/graphics/shared/Graphics';
import { Sprite } from '~/scene/sprite/Sprite';
import { GlobalResourceRegistry } from '~/utils/pool/GlobalResourceRegistry';

import type EventEmitter from 'eventemitter3';

function createSource(): TextureSource
{
    return new TextureSource({ width: 2, height: 2 });
}

function changeListeners(...emitters: EventEmitter[]): number[]
{
    return emitters.map((emitter) => emitter.listenerCount('change'));
}

describe('getTextureBatchBindGroup', () =>
{
    afterEach(() => jest.restoreAllMocks());

    it('should fill unused slots with the empty texture without listening to it', () =>
    {
        const before = changeListeners(Texture.EMPTY.source, Texture.EMPTY.source.style);
        const groups = [
            getTextureBatchBindGroup([createSource()], 1, 16),
            getTextureBatchBindGroup([createSource()], 1, 16),
            getTextureBatchBindGroup([createSource()], 1, 16),
        ];

        for (const group of groups)
        {
            expect(Object.keys(group.resources)).toHaveLength(32);
            expect(group.resources[2]).toBe(Texture.EMPTY.source);
            expect(group.resources[3]).toBe(Texture.EMPTY.source.style);
        }

        expect(changeListeners(Texture.EMPTY.source, Texture.EMPTY.source.style)).toEqual(before);
    });

    it('should return the same group for the same textures in the same order', () =>
    {
        const a = createSource();
        const b = createSource();
        const group = getTextureBatchBindGroup([a, b], 2, 16);

        expect(getTextureBatchBindGroup([a, b], 2, 16)).toBe(group);
    });

    it('should release a group without warning when one of its textures is destroyed', () =>
    {
        const a = createSource();
        const b = createSource();
        const listenersBefore = b.listenerCount('change');

        getTextureBatchBindGroup([a, b], 2, 16);

        const warn = jest.spyOn(console, 'warn').mockImplementation(() => { /* silenced */ });

        a.destroy();

        expect(warn).not.toHaveBeenCalled();
        expect(b.listenerCount('change')).toBe(listenersBefore);
    });

    it('should give different groups to two texture sets that share a cache key', () =>
    {
        // both uid sets produce the same cache key
        const firstUids = [143, 102, 146, 123, 130, 134, 112, 151, 149, 125, 100, 127, 118, 136, 126, 119];
        const secondUids = [117, 152, 127, 147, 102, 133, 103, 135, 122, 124, 105, 137, 119, 140, 143, 139];
        const lastUid = Math.max(...firstUids, ...secondUids);
        const sourcesByUid: TextureSource[] = [];
        let source: TextureSource;

        do
        {
            source = createSource();
            sourcesByUid[source.uid] = source;
        } while (source.uid < lastUid);

        const pick = (uids: number[]) => uids.map((uid) =>
        {
            if (!sourcesByUid[uid]) throw new Error(`no texture source was created with uid ${uid}`);

            return sourcesByUid[uid];
        });
        const first = pick(firstUids);
        const second = pick(secondUids);

        const firstGroup = getTextureBatchBindGroup(first, 16, 16);
        const secondGroup = getTextureBatchBindGroup(second, 16, 16);

        expect(secondGroup).not.toBe(firstGroup);
        expect(secondGroup.resources[0]).toBe(second[0]);
    });

    it('should size the group by the max textures it is asked for', () =>
    {
        const textures = [createSource()];

        expect(Object.keys(getTextureBatchBindGroup(textures, 1, 16).resources)).toHaveLength(32);
        expect(Object.keys(getTextureBatchBindGroup(textures, 1, 8).resources)).toHaveLength(16);
    });

    it('should release every group when the global resources are released', () =>
    {
        const source = createSource();
        const listenersBefore = source.listenerCount('change');
        const group = getTextureBatchBindGroup([source], 1, 16);

        GlobalResourceRegistry.release();

        expect(source.listenerCount('change')).toBe(listenersBefore);
        expect(getTextureBatchBindGroup([source], 1, 16)).not.toBe(group);
    });

    describeLocalOnly('with a WebGPU renderer', () =>
    {
        it('should not warn when a render texture is destroyed after its sprite', async () =>
        {
            const renderer = await getWebGPURenderer();
            const stage = new Container();
            const texture = RenderTexture.create({ width: 8, height: 8 });
            const sprite = new Sprite(texture);
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => { /* silenced */ });

            stage.addChild(sprite);
            renderer.render(stage);
            stage.removeChild(sprite);
            sprite.destroy();
            renderer.render(stage);
            texture.destroy(true);
            renderer.render(stage);

            expect(warn).not.toHaveBeenCalled();

            renderer.destroy();
        });

        it('should keep rendering after destroying a sprite and its texture between frames', async () =>
        {
            const renderer = await getWebGPURenderer();
            const stage = new Container();
            const sprite = new Sprite(getTexture({ width: 8, height: 8 }));
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => { /* silenced */ });

            stage.addChild(sprite);
            renderer.render(stage);
            sprite.destroy({ texture: true, textureSource: true });

            expect(() => renderer.render(stage)).not.toThrow();
            expect(warn).not.toHaveBeenCalled();

            renderer.destroy();
        });

        it('should draw again after the renderer GC sweeps idle groups', async () =>
        {
            const renderer = await getWebGPURenderer({ width: 32, height: 32, resolution: 1 });
            const spriteTexture = getTexture({ width: 8, height: 8 });
            const graphicsTexture = getTexture({ width: 8, height: 8 });
            const graphics = new Graphics();
            const stage = new Container();

            graphics.context.batchMode = 'no-batch';
            graphics.texture(graphicsTexture, 0xffffff, 0, 0, 8, 8);
            graphics.x = 16;
            stage.addChild(new Sprite(spriteTexture), graphics);

            const sources = [spriteTexture.source, graphicsTexture.source];
            const start = changeListeners(...sources);
            const drawn = start.map((count) => count + 1);

            renderer.render(stage);
            renderer.render(stage);

            expect(changeListeners(...sources)).toEqual(drawn);

            const maxUnusedTime = renderer.gc.maxUnusedTime;

            renderer.gc.maxUnusedTime = 0;
            renderer.gc.run();
            renderer.gc.maxUnusedTime = maxUnusedTime;

            expect(changeListeners(...sources)).toEqual(start);
            expect(() => renderer.render(stage)).not.toThrow();
            expect(changeListeners(...sources)).toEqual(drawn);

            const { pixels } = renderer.extract.pixels(stage);
            const white = [255, 255, 255, 255];

            expect(Array.from(pixels.subarray(0, 4))).toEqual(white);
            expect(Array.from(pixels.subarray(16 * 4, (16 * 4) + 4))).toEqual(white);

            renderer.destroy();
        });

        it('should draw unchanged batches after the cache releases their groups', async () =>
        {
            // the batch pool's clear also destroys batches taken out of it, so start with an empty pool
            GlobalResourceRegistry.release();

            const renderer = await getWebGPURenderer({ width: 32, height: 32, resolution: 1 });
            const graphics = new Graphics();
            const stage = new Container();

            graphics.context.batchMode = 'no-batch';
            graphics.texture(getTexture({ width: 8, height: 8 }), 0xffffff, 0, 0, 8, 8);
            graphics.x = 16;
            stage.addChild(new Sprite(getTexture({ width: 8, height: 8 })), graphics);

            renderer.render(stage);
            GlobalResourceRegistry.release();

            expect(() => renderer.render(stage)).not.toThrow();

            const { pixels } = renderer.extract.pixels(stage);
            const white = [255, 255, 255, 255];

            expect(Array.from(pixels.subarray(0, 4))).toEqual(white);
            expect(Array.from(pixels.subarray(16 * 4, (16 * 4) + 4))).toEqual(white);

            renderer.destroy();
        });

        it('should fetch new groups after another renderer\'s GC swept the ones a batch still holds', async () =>
        {
            const renderer = await getWebGPURenderer({ width: 32, height: 32, resolution: 1 });
            const other = await getWebGPURenderer({ width: 32, height: 32, resolution: 1 });
            const spriteTexture = getTexture({ width: 8, height: 8 });
            const graphicsTexture = getTexture({ width: 8, height: 8 });
            const graphics = new Graphics();
            const stage = new Container();

            graphics.context.batchMode = 'no-batch';
            graphics.texture(graphicsTexture, 0xffffff, 0, 0, 8, 8);
            graphics.x = 16;
            stage.addChild(new Sprite(spriteTexture), graphics);

            const sources = [spriteTexture.source, graphicsTexture.source];
            const start = changeListeners(...sources);
            const drawn = start.map((count) => count + 1);

            renderer.render(stage);
            renderer.render(stage);

            expect(changeListeners(...sources)).toEqual(drawn);

            other.gc.maxUnusedTime = 0;
            other.gc.run();

            expect(changeListeners(...sources)).toEqual(start);
            expect(() => renderer.render(stage)).not.toThrow();
            expect(changeListeners(...sources)).toEqual(drawn);

            const { pixels } = renderer.extract.pixels(stage);
            const white = [255, 255, 255, 255];

            expect(Array.from(pixels.subarray(0, 4))).toEqual(white);
            expect(Array.from(pixels.subarray(16 * 4, (16 * 4) + 4))).toEqual(white);

            other.destroy();
            renderer.destroy();
        });

        it('should draw again after unloading the empty texture that pads the groups', async () =>
        {
            const renderer = await getWebGPURenderer();
            const device = renderer.gpu.device;
            const stage = new Container();

            stage.addChild(new Sprite(getTexture({ width: 8, height: 8 })));
            renderer.render(stage);

            await device.queue.onSubmittedWorkDone();
            Texture.EMPTY.source.unload();

            device.pushErrorScope('validation');
            renderer.render(stage);

            expect(await device.popErrorScope()).toBeNull();

            renderer.destroy();
        });

        it('should keep reporting a texture destroyed while its sprite is still drawn', async () =>
        {
            const renderer = await getWebGPURenderer();
            const texture = getTexture({ width: 8, height: 8 });
            const stage = new Container();

            stage.addChild(new Sprite(texture));
            renderer.render(stage);
            texture.destroy(true);

            expect(() => renderer.render(stage)).toThrow('was destroyed while a shader still uses it');
            expect(() => renderer.render(stage)).toThrow('was destroyed while a shader still uses it');

            renderer.destroy();
        });
    });
});
