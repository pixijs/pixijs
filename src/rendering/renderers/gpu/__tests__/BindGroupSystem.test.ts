import { describeLocalOnly, getTexture, getWebGPURenderer, loseAndRestoreDevice } from '@test-utils';
import { Sprite } from '~/scene';

import type { WebGPURenderer } from '../WebGPURenderer';

let renderer: WebGPURenderer;

afterEach(() =>
{
    renderer?.destroy();
    renderer = null;
});

// the sweep nulls a slot rather than deleting it, so "live" means non-null
function liveEntries()
{
    return Object.values(renderer.bindGroup['_hash']).filter(Boolean);
}

// old enough that the next sweep treats the entry as idle
function backdate(entries: { _gcLastUsed: number }[]): void
{
    const stale = performance.now() - renderer.gc.maxUnusedTime;

    for (const entry of entries)
    {
        entry._gcLastUsed = stale;
    }
}

// the GC schedules its clean pass through the renderer's scheduler; fire that task directly
function runCleanPass(): void
{
    const id = renderer.gc['_collectionsHandler'];

    renderer.scheduler['_tasks'].find((task) => task.id === id).func(0);
}

describeLocalOnly('BindGroupSystem cache sweep', () =>
{
    it('re-stamps entries on a cache hit instead of growing the cache', async () =>
    {
        renderer = await getWebGPURenderer();
        const sprite = new Sprite({ texture: getTexture() });

        renderer.render(sprite);

        const first = liveEntries();

        expect(first.length).toBeGreaterThan(0);

        backdate(first);
        renderer.render(sprite);

        const second = liveEntries();

        expect(second).toHaveLength(first.length);
        expect(second).toEqual(expect.arrayContaining(first));

        for (const entry of first)
        {
            expect(entry._gcLastUsed).toBe(renderer.gc.now);
        }
    });

    it('sweeps the entries a texture unload strands and keeps the ones still in use', async () =>
    {
        renderer = await getWebGPURenderer();
        const texture = getTexture();
        const sprite = new Sprite({ texture });

        renderer.render(sprite);

        const before = liveEntries();

        // only the entries the next frame touches get a fresh stamp back
        backdate(before);
        texture.source.unload();
        renderer.render(sprite);

        const after = liveEntries();
        const used = after.filter((entry) => entry._gcLastUsed === renderer.gc.now);
        const stranded = after.filter((entry) => !used.includes(entry));

        expect(stranded.length).toBeGreaterThan(0);
        expect(after).toHaveLength(before.length + stranded.length);

        renderer.gc.run();

        const survivors = liveEntries();

        expect(survivors).toHaveLength(before.length);
        expect(survivors).toEqual(expect.arrayContaining(used));

        for (const entry of stranded)
        {
            expect(survivors).not.toContain(entry);
            expect(entry.gpuBindGroup).toBeNull();
        }
    });

    it('renders again after a sweep, rebuilding only what the frame needs', async () =>
    {
        renderer = await getWebGPURenderer();
        const sprite = new Sprite({ texture: getTexture() });

        renderer.render(sprite);

        const count = liveEntries().length;

        backdate(liveEntries());
        renderer.gc.run();

        expect(liveEntries()).toHaveLength(0);

        expect(() => renderer.render(sprite)).not.toThrow();
        expect(liveEntries()).toHaveLength(count);
        expect(renderer.extract.pixels(sprite).pixels.some((value) => value > 0)).toBe(true);
    });

    it('starts a fresh cache after a device loss and keeps sweeping it', async () =>
    {
        renderer = await getWebGPURenderer();
        const sprite = new Sprite({ texture: getTexture() });

        renderer.render(sprite);

        const previousHash = renderer.bindGroup['_hash'];

        await loseAndRestoreDevice(renderer);

        expect(renderer.bindGroup['_hash']).not.toBe(previousHash);
        expect(liveEntries()).toHaveLength(0);

        renderer.render(sprite);

        expect(liveEntries().length).toBeGreaterThan(0);

        backdate(liveEntries());
        renderer.gc.run();

        expect(liveEntries()).toHaveLength(0);
    });

    it('compacts swept slots out of the hash on the GC clean pass', async () =>
    {
        renderer = await getWebGPURenderer();

        const registration = renderer.gc['_managedCollections'].find((entry) => entry.context === renderer.bindGroup);

        expect(registration).toMatchObject({ collection: '_hash', type: 'hash' });

        const sprite = new Sprite({ texture: getTexture() });

        renderer.render(sprite);

        const keys = Object.keys(renderer.bindGroup['_hash']);

        backdate(liveEntries());
        renderer.gc.run();

        // the sweep only nulls slots; the keys stay until the clean pass rebuilds the hash
        expect(Object.keys(renderer.bindGroup['_hash'])).toEqual(keys);

        runCleanPass();

        expect(Object.keys(renderer.bindGroup['_hash'])).toHaveLength(0);

        renderer.render(sprite);

        expect(liveEntries()).toHaveLength(keys.length);
    });
});
