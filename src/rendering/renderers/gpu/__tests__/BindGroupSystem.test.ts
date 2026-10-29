import { UniformGroup } from '../../shared/shader/UniformGroup';
import { TextureSource } from '../../shared/texture/sources/TextureSource';
import { BindGroup } from '../shader/BindGroup';
import { GpuProgram } from '../shader/GpuProgram';
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

describeLocalOnly('BindGroupSystem lookup', () =>
{
    const wgsl = /* wgsl */`
        @group(0) @binding(0) var uTexture: texture_2d<f32>;
        @group(0) @binding(1) var uSampler: sampler;

        @vertex
        fn vsMain(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
            return vec4<f32>(aPosition, 0.0, 1.0);
        }

        @fragment
        fn fsMain() -> @location(0) vec4<f32> {
            return textureSample(uTexture, uSampler, vec2<f32>(0.5));
        }
    `;

    let program: GpuProgram;

    function createGroup(source: TextureSource): BindGroup
    {
        return new BindGroup({ 0: source, 1: source.style });
    }

    function resolve(bindGroup: BindGroup): GPUBindGroup
    {
        return renderer.bindGroup.getBindGroup(bindGroup, program, 0);
    }

    beforeEach(async () =>
    {
        renderer = await getWebGPURenderer();
        program = GpuProgram.from({
            vertex: { source: wgsl, entryPoint: 'vsMain' },
            fragment: { source: wgsl, entryPoint: 'fsMain' },
        });
    });

    it('shares one native group between groups holding the same resources', () =>
    {
        const source = new TextureSource({ width: 16, height: 16 });
        const native = resolve(createGroup(source));

        expect(resolve(createGroup(source))).toBe(native);
        expect(liveEntries()).toHaveLength(1);

        expect(resolve(createGroup(new TextureSource({ width: 16, height: 16 })))).not.toBe(native);
        expect(liveEntries()).toHaveLength(2);
    });

    it('returns the original native group when a binding is re-pointed and pointed back', () =>
    {
        const source = new TextureSource({ width: 16, height: 16 });
        const other = new TextureSource({ width: 16, height: 16 });
        const bindGroup = createGroup(source);
        const native = resolve(bindGroup);

        bindGroup.setResource(other, 0);

        const repointed = resolve(bindGroup);

        expect(repointed).not.toBe(native);

        bindGroup.setResource(source, 0);

        expect(resolve(bindGroup)).toBe(native);
        expect(liveEntries()).toHaveLength(2);
    });

    it('builds a new native group once a resource has been unloaded', () =>
    {
        const source = new TextureSource({ width: 16, height: 16 });
        const bindGroup = createGroup(source);
        const native = resolve(bindGroup);

        source.unload();

        expect(resolve(bindGroup)).not.toBe(native);
    });

    it('answers from the group itself while it has not changed', () =>
    {
        const source = new TextureSource({ width: 16, height: 16 });
        const bindGroup = createGroup(source);
        const native = resolve(bindGroup);
        const entry = bindGroup._gpuEntry;

        // with the cache emptied, only the group's own entry can still answer
        renderer.bindGroup['_hash'] = Object.create(null);
        entry._gcLastUsed = 0;

        expect(resolve(bindGroup)).toBe(native);
        expect(entry._gcLastUsed).toBe(renderer.gc.now);
        expect(liveEntries()).toHaveLength(0);
    });

    it('does not answer from an entry the GC has swept', () =>
    {
        const source = new TextureSource({ width: 16, height: 16 });
        const bindGroup = createGroup(source);
        const native = resolve(bindGroup);

        backdate(liveEntries());
        renderer.gc.run();

        expect(bindGroup._gpuEntry.gpuBindGroup).toBeNull();

        const rebuilt = resolve(bindGroup);

        expect(rebuilt).not.toBeNull();
        expect(rebuilt).not.toBe(native);
        expect(liveEntries()).toHaveLength(1);
    });

    it('does not carry a group\'s entry across a device loss', async () =>
    {
        const source = new TextureSource({ width: 16, height: 16 });
        const bindGroup = createGroup(source);
        const native = resolve(bindGroup);

        await loseAndRestoreDevice(renderer);

        expect(resolve(bindGroup)).not.toBe(native);
        expect(liveEntries()).toHaveLength(1);
    });

    it('builds its own native group when another renderer on the same device resolved the group first', async () =>
    {
        const sharing = await getWebGPURenderer({ gpu: renderer.gpu });
        const bindGroup = createGroup(new TextureSource({ width: 16, height: 16 }));
        const sharingNative = sharing.bindGroup.getBindGroup(bindGroup, program, 0);

        expect(resolve(bindGroup)).not.toBe(sharingNative);
        expect(liveEntries()).toHaveLength(1);

        sharing.destroy();
    });

    it('keeps rendering after a renderer sharing its device is destroyed', async () =>
    {
        const sharing = await getWebGPURenderer({ gpu: renderer.gpu });
        const texture = getTexture();
        const sprite = new Sprite({ texture });
        const { device } = renderer.gpu;

        sharing.render(new Sprite({ texture }));
        renderer.render(sprite);
        sharing.destroy();

        device.pushErrorScope('validation');
        renderer.render(sprite);

        const { pixels } = renderer.extract.pixels(sprite);

        expect(await device.popErrorScope()).toBeNull();
        expect(Array.from(pixels.slice(0, 4))).toEqual([255, 255, 255, 255]);
    });

    it('keeps two keys that land on one cache slot apart', () =>
    {
        const bindGroup = createGroup(new TextureSource({ width: 16, height: 16 }));
        const clashing = createGroup(new TextureSource({ width: 16, height: 16 }));

        // the slot comes from the low half alone, so this is a clash only the high half tells apart
        clashing._keyLow = bindGroup._keyLow;

        const native = resolve(bindGroup);
        const clashingNative = resolve(clashing);

        expect(clashingNative).not.toBe(native);

        // one slot, one entry: the second replaced the first
        expect(liveEntries()).toHaveLength(1);

        // each group still answers with its own, and a lookup that misses rebuilds rather than borrows
        expect(resolve(bindGroup)).toBe(native);

        bindGroup._gpuEntry = null;

        const rebuilt = resolve(bindGroup);

        expect(rebuilt).not.toBe(native);
        expect(rebuilt).not.toBe(clashingNative);
    });
});

describeLocalOnly('BindGroupSystem with a bind group layout', () =>
{
    const vertex = {
        entryPoint: 'main',
        source: /* wgsl */`
            @vertex fn main(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
                return vec4<f32>(aPosition, 0.0, 1.0);
            }
        `,
    };

    // the bindings a program can declare, each numbered by its place in the list it is declared in
    const declarations: Record<string, string> = {
        tintUniforms: 'var<uniform> tintUniforms: Tint;',
        uTexture: 'var uTexture: texture_2d<f32>;',
        uSampler: 'var uSampler: sampler;',
        offsetUniforms: 'var<uniform> offsetUniforms: Offset;',
    };
    const uses: Record<string, string> = {
        tintUniforms: 'color *= tintUniforms.uTint;',
        uTexture: 'color *= textureSample(uTexture, uSampler, uv);',
        uSampler: '',
        offsetUniforms: 'uv += offsetUniforms.uOffset;',
    };

    function makeProgram(bindings: string[])
    {
        return new GpuProgram({
            vertex,
            fragment: {
                entryPoint: 'main',
                source: /* wgsl */`
                    struct Tint { uTint: vec4<f32> }
                    struct Offset { uOffset: vec2<f32> }
                    ${bindings.map((name, i) => `@group(0) @binding(${i}) ${declarations[name]}`).join('\n')}

                    @fragment fn main() -> @location(0) vec4<f32> {
                        var uv = vec2<f32>(0.5);
                        var color = vec4<f32>(1.0);
                        ${bindings.map((name) => uses[name]).join('\n')}
                        return color;
                    }
                `,
            },
        });
    }

    // the native entries the system hands the device for one bind group
    function entriesFor(bindGroup: BindGroup, program: GpuProgram): GPUBindGroupEntry[]
    {
        const createBindGroup = jest.spyOn(renderer.gpu.device, 'createBindGroup');

        renderer.bindGroup.getBindGroup(bindGroup, program, 0);

        const [descriptor] = createBindGroup.mock.calls[0];

        createBindGroup.mockRestore();

        return [...descriptor.entries];
    }

    it('should bind each of the shader\'s bindings to the resource of the same name', async () =>
    {
        renderer = await getWebGPURenderer();

        const tint = new UniformGroup({ uTint: { value: [1, 1, 1, 1], type: 'vec4<f32>' } });
        const offset = new UniformGroup({ uOffset: { value: [0, 0], type: 'vec2<f32>' } });
        const texture = getTexture().source;
        const bindGroup = new BindGroup({
            tintUniforms: tint, uTexture: texture, uSampler: texture.style, offsetUniforms: offset,
        });

        // numbered as the group is, and numbered differently with one binding left out
        const full = makeProgram(['tintUniforms', 'uTexture', 'uSampler', 'offsetUniforms']);
        const subset = makeProgram(['uTexture', 'uSampler', 'tintUniforms']);

        // a uniform group's buffer is created by the ubo system on first use
        renderer.ubo.updateUniformGroup(tint);
        renderer.ubo.updateUniformGroup(offset);

        const textureView = renderer.texture.getTextureView(texture);
        const tintBuffer = renderer.buffer.getGPUBuffer(tint.buffer);
        const offsetBuffer = renderer.buffer.getGPUBuffer(offset.buffer);

        const fullEntries = entriesFor(bindGroup, full);

        expect(fullEntries.map((entry) => entry.binding)).toEqual([0, 1, 2, 3]);
        expect((fullEntries[0].resource as GPUBufferBinding).buffer).toBe(tintBuffer);
        expect(fullEntries[1].resource).toBe(textureView);
        expect((fullEntries[3].resource as GPUBufferBinding).buffer).toBe(offsetBuffer);

        const subsetEntries = entriesFor(bindGroup, subset);

        expect(subsetEntries.map((entry) => entry.binding)).toEqual([0, 1, 2]);
        expect(subsetEntries[0].resource).toBe(textureView);
        expect((subsetEntries[2].resource as GPUBufferBinding).buffer).toBe(tintBuffer);
    });

    it('should name the shader binding the layout lacks', async () =>
    {
        renderer = await getWebGPURenderer();

        const texture = getTexture().source;
        const bindGroup = new BindGroup({ uTexture: texture, uSampler: texture.style });
        const program = makeProgram(['uTexture', 'uSampler', 'tintUniforms']);

        expect(() => renderer.bindGroup.getBindGroup(bindGroup, program, 0))
            .toThrow(/no usable resource for the shader's 'tintUniforms' binding/);
    });
});
