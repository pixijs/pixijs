import { BindGroup } from '../gpu/shader/BindGroup';
import { Buffer } from '../shared/buffer/Buffer';
import { BufferResource } from '../shared/buffer/BufferResource';
import { BufferUsage } from '../shared/buffer/const';
import { UniformGroup } from '../shared/shader/UniformGroup';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { TextureStyle } from '../shared/texture/TextureStyle';
import { itLocalOnly } from '@test-utils';

import type { BindResource } from '../gpu/shader/BindResource';

// both halves of the key, as one comparable value
function keyOf(bindGroup: BindGroup): string
{
    return `${bindGroup._keyLow}:${bindGroup._keyHigh}`;
}

describe('BindGroup', () =>
{
    it('should init correctly', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array(100),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        expect(buffer.descriptor.size).toBe(400);
    });

    it('should let a bufferResource know if it has changed correctly', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array(100),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        const bufferResource = new BufferResource({
            buffer,
            offset: 100,
            size: 200
        });

        const bufferResourceId = bufferResource._resourceId;

        buffer.data = new Float32Array(200);

        expect(bufferResourceId).not.toBe(bufferResource._resourceId);
    });

    it('should not update resourceID if its the same size buffer', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array(100),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        const bufferId = buffer._resourceId;

        const updateListener = jest.fn();
        const changeListener = jest.fn();

        buffer.on('update', updateListener);
        buffer.on('change', changeListener);

        buffer.data = new Float32Array(100);

        expect(bufferId).toBe(buffer._resourceId);

        expect(updateListener).toHaveBeenCalledTimes(1);
        expect(changeListener).toHaveBeenCalledTimes(0);

        buffer.data = new Float32Array(50);

        expect(bufferId).not.toBe(buffer._resourceId);

        expect(updateListener).toHaveBeenCalledTimes(1);
        expect(changeListener).toHaveBeenCalledTimes(1);
    });

    it('should let a BindGroup know if buffer has changed correctly', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array(100),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        const bindGroup = new BindGroup({
            0: buffer,
        });

        const bindGroupKey = keyOf(bindGroup);

        buffer.data = new Float32Array(200);

        expect(bindGroupKey).not.toBe(keyOf(bindGroup));
    });

    it('should let a BindGroup know if bufferResource has changed correctly', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array(100),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        const bufferResource = new BufferResource({
            buffer,
            offset: 100,
            size: 200
        });

        const bindGroup = new BindGroup({
            0: bufferResource,
        });

        const bindGroupKey = keyOf(bindGroup);

        buffer.data = new Float32Array(200);

        expect(bindGroupKey).not.toBe(keyOf(bindGroup));
    });

    it('should let a BindGroup know when a buffer is unloaded', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array(100),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        const bindGroup = new BindGroup({
            0: buffer,
        });

        const bindGroupKey = keyOf(bindGroup);

        buffer.unload();

        expect(keyOf(bindGroup)).not.toBe(bindGroupKey);
    });

    it('should re-key when the buffer behind a uniform group is unloaded', () =>
    {
        const uniformGroup = new UniformGroup({
            test: { value: 1, type: 'f32' },
        });

        const buffer = new Buffer({
            data: new Float32Array(16),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        uniformGroup.buffer = buffer;

        const bindGroup = new BindGroup({
            0: uniformGroup,
        });

        const bindGroupKey = keyOf(bindGroup);

        buffer.unload();

        expect(keyOf(bindGroup)).not.toBe(bindGroupKey);
    });

    it('_touch should stamp the buffers behind uniform groups and buffer resources', () =>
    {
        const uniformGroup = new UniformGroup({
            test: { value: 1, type: 'f32' },
        });

        const groupBuffer = new Buffer({
            data: new Float32Array(16),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        uniformGroup.buffer = groupBuffer;

        const buffer = new Buffer({
            data: new Float32Array(64),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        const bufferResource = new BufferResource({
            buffer,
            offset: 0,
            size: 128,
        });

        const bindGroup = new BindGroup({
            0: uniformGroup,
            1: bufferResource,
        });

        bindGroup._touch(123);

        expect(groupBuffer._gcLastUsed).toBe(123);
        expect(buffer._gcLastUsed).toBe(123);

        // the proxies delegate their own stamp straight through to the buffer
        expect(uniformGroup._gcLastUsed).toBe(123);
        expect(bufferResource._gcLastUsed).toBe(123);

        // a binding added after the first touch, past a gap, is stamped too
        const lateBuffer = new Buffer({
            data: new Float32Array(16),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        bindGroup.setResource(lateBuffer, 3);
        bindGroup._touch(456);

        expect(lateBuffer._gcLastUsed).toBe(456);
        expect(buffer._gcLastUsed).toBe(456);
    });

    it('should key a group by the resources it holds and the bindings they are at', () =>
    {
        const texture = new TextureSource();
        const other = new TextureSource();
        const style = new TextureStyle();

        const bindGroup = new BindGroup({ 0: texture, 1: style });

        // same resources, same bindings: same key, whichever group holds them
        expect(keyOf(new BindGroup({ 0: texture, 1: style }))).toBe(keyOf(bindGroup));

        // one different resource
        expect(keyOf(new BindGroup({ 0: other, 1: style }))).not.toBe(keyOf(bindGroup));

        // the same resources at other bindings
        const swapped = new BindGroup();

        swapped.setResource(style, 0);
        swapped.setResource(texture, 1);

        expect(keyOf(swapped)).not.toBe(keyOf(bindGroup));

        const gapped = new BindGroup();

        gapped.setResource(texture, 0);
        gapped.setResource(style, 2);

        expect(keyOf(gapped)).not.toBe(keyOf(bindGroup));

        // the order the bindings were filled in does not matter
        const reversed = new BindGroup();

        reversed.setResource(style, 1);
        reversed.setResource(texture, 0);

        expect(keyOf(reversed)).toBe(keyOf(bindGroup));
    });

    it('should return to the same key when a binding is re-pointed and pointed back', () =>
    {
        const texture = new TextureSource();
        const other = new TextureSource();
        const bindGroup = new BindGroup({ 0: texture, 1: texture.style });
        const bindGroupKey = keyOf(bindGroup);

        bindGroup.setResource(other, 0);

        expect(keyOf(bindGroup)).not.toBe(bindGroupKey);

        bindGroup.setResource(texture, 0);

        expect(keyOf(bindGroup)).toBe(bindGroupKey);
    });

    it('should stay in step with a group built from scratch through every kind of change', () =>
    {
        const first = new TextureSource();
        const second = new TextureSource();
        const third = new TextureSource();
        const bindGroup = new BindGroup({ 0: first, 1: second, 2: first });

        // an id that moves, in a resource held at two bindings
        first.unload();
        expect(keyOf(bindGroup)).toBe(keyOf(new BindGroup({ 0: first, 1: second, 2: first })));

        // a re-point after the id moved takes the id it was keyed with back out, not the current one
        second.unload();
        bindGroup.setResource(third, 1);
        expect(keyOf(bindGroup)).toBe(keyOf(new BindGroup({ 0: first, 1: third, 2: first })));

        // a destroyed resource's null slot, refilled
        third.destroy();
        expect(bindGroup.resources[1]).toBeNull();

        bindGroup.setResource(second, 1);
        expect(keyOf(bindGroup)).toBe(keyOf(new BindGroup({ 0: first, 1: second, 2: first })));
    });

    it('should drop its resolved entry whenever the key moves', () =>
    {
        const texture = new TextureSource();
        const other = new TextureSource();
        const bindGroup = new BindGroup({ 0: texture });
        const entry = {} as BindGroup['_gpuEntry'];

        bindGroup._gpuEntry = entry;
        bindGroup.setResource(texture, 0);

        // setting the resource already there changes nothing
        expect(bindGroup._gpuEntry).toBe(entry);

        bindGroup.setResource(other, 0);
        expect(bindGroup._gpuEntry).toBeNull();

        bindGroup._gpuEntry = entry;
        other.unload();
        expect(bindGroup._gpuEntry).toBeNull();

        bindGroup._gpuEntry = entry;
        bindGroup.setResource(texture.style, 1);
        expect(bindGroup._gpuEntry).toBeNull();
    });

    it('should key an unwatched resource without listening to it', () =>
    {
        const texture = new TextureSource();
        const other = new TextureSource();
        const bindGroup = new BindGroup();

        bindGroup.setResourceUnwatched(texture, 0);
        bindGroup.setResourceUnwatched(other, 0);
        bindGroup.setResourceUnwatched(texture, 0);

        expect(texture.listenerCount('change')).toBe(0);
        expect(other.listenerCount('change')).toBe(0);
        expect(bindGroup._resourceKeys).toEqual([0]);
        expect(keyOf(bindGroup)).toBe(keyOf(new BindGroup({ 0: texture })));

        // nothing tells the group the id moved until its owner does
        const bindGroupKey = keyOf(bindGroup);

        texture.unload();
        expect(keyOf(bindGroup)).toBe(bindGroupKey);

        bindGroup['onResourceChange'](texture);
        expect(keyOf(bindGroup)).toBe(keyOf(new BindGroup({ 0: texture })));
    });

    it('should give every distinct set of resources its own key', () =>
    {
        // dense ascending ids, as uid('resource') hands them out, in the two shapes groups come in
        const resource = (id: number) => ({ _resourceId: id }) as BindResource;
        const resources: BindResource[] = [];

        for (let i = 0; i < 4096; i++) resources.push(resource(i));

        const keys = new Set<string>();
        const lows = new Set<number>();
        const highs = new Set<number>();
        let count = 0;
        let seed = 1234;

        const random = () =>
        {
            seed = (Math.imul(seed, 1664525) + 1013904223) | 0;

            return (seed >>> 8) & 4095;
        };

        const add = (bindGroup: BindGroup) =>
        {
            keys.add(keyOf(bindGroup));
            lows.add(bindGroup._keyLow);
            highs.add(bindGroup._keyHigh);
            count++;
        };

        // every pair of neighbouring ids, both ways round: 2D's texture + style shape
        for (let i = 0; i + 1 < resources.length; i++)
        {
            add(new BindGroup({ 0: resources[i], 1: resources[i + 1] }));
            add(new BindGroup({ 0: resources[i + 1], 1: resources[i] }));
        }

        // one wide group re-pointed a binding at a time: a batcher's texture group
        const wide = new BindGroup();
        const held: number[] = [];

        for (let i = 0; i < 16; i++)
        {
            held.push(i);
            wide.setResource(resources[i], i);
        }

        const seen = new Set<string>([held.join()]);

        add(wide);

        for (let i = 0; i < 60000; i++)
        {
            const index = i & 15;

            held[index] = random();
            wide.setResource(resources[held[index]], index);

            if (seen.has(held.join())) continue;

            seen.add(held.join());
            add(wide);
        }

        // the whole key never repeats; a 32-bit half may, about count² / 2³³ times (~0.6 here)
        expect(keys.size).toBe(count);
        expect(count - lows.size).toBeLessThan(8);
        expect(count - highs.size).toBeLessThan(8);
    });

    it('should null the slot when a destroyed buffer resource has no safe fallback', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array(100),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        const bufferResource = new BufferResource({
            buffer,
            offset: 100,
            size: 200
        });

        const bindGroup = new BindGroup({
            0: bufferResource,
        });

        const bindGroupKey = keyOf(bindGroup);

        bufferResource.destroy();

        // the group survives with a null slot, and every consumer must tolerate it
        expect(bindGroup.resources[0]).toBeNull();
        expect(keyOf(bindGroup)).not.toBe(bindGroupKey);
        expect(() => bindGroup._touch(0)).not.toThrow();
    });

    it('should accept (and warn about) an already-destroyed resource without throwing', () =>
    {
        const source = new TextureSource({ width: 16, height: 16 });

        source.destroy();

        // input zombies are warned about, not fatal — actually rendering with one
        // raises a clear error in BindGroupSystem
        const bindGroup = new BindGroup({ 0: source });

        expect(bindGroup.resources[0]).toBe(source);
    });

    itLocalOnly('should raise a clear error when resolving a bind group whose resource was destroyed', async () =>
    {
        const { getWebGPURenderer } = await import('@test-utils');
        const { GpuProgram } = await import('../gpu/shader/GpuProgram');

        const renderer = await getWebGPURenderer();

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
        const program = GpuProgram.from({
            vertex: { source: wgsl, entryPoint: 'vsMain' },
            fragment: { source: wgsl, entryPoint: 'fsMain' },
        });

        const source = new TextureSource({ width: 16, height: 16 });
        const bindGroup = new BindGroup({ 0: source, 1: source.style });

        // the classic mistake: destroy a resource a shader still uses, then render
        source.destroy();

        const bindGroupSystem = (renderer as any).bindGroup;

        expect(() => bindGroupSystem.getBindGroup(bindGroup, program, 0))
            .toThrow('was destroyed while a shader still uses it');

        renderer.destroy();
    });

    it('should null the slot when a bound texture is destroyed', () =>
    {
        const source = new TextureSource({ width: 16, height: 16 });

        const bindGroup = new BindGroup({
            0: source,
        });

        const bindGroupKey = keyOf(bindGroup);

        source.destroy();

        expect(bindGroup.resources[0]).toBeNull();
        expect(keyOf(bindGroup)).not.toBe(bindGroupKey);
        expect(() => bindGroup._touch(0)).not.toThrow();
    });

    it('should warn when a texture it binds is destroyed', () =>
    {
        const source = new TextureSource({ width: 16, height: 16 });
        const bindGroup = new BindGroup({ 0: source, 1: source.style });
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => { /* silenced */ });

        source.destroy();

        expect(warn).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('was destroyed while still bound to a shader'),
        );
        warn.mockRestore();
        expect(bindGroup.resources[0]).toBeNull();
    });

    it('should track each binding number once, gaps included', () =>
    {
        const source = new TextureSource({ width: 16, height: 16 });
        const other = new TextureSource({ width: 16, height: 16 });
        const bindGroup = new BindGroup();

        bindGroup.setResource(source, 0);
        bindGroup.setResource(source.style, 3);

        const keys = bindGroup._resourceKeys;

        expect(keys).toEqual([0, 3]);

        // replacing a resource keeps its binding number
        bindGroup.setResource(other, 0);

        expect(bindGroup._resourceKeys).toBe(keys);

        // the null slot a destroyed resource leaves behind keeps its binding number
        other.destroy();

        expect(bindGroup._resourceKeys).toBe(keys);

        // and so does refilling it
        bindGroup.setResource(source, 0);

        expect(bindGroup._resourceKeys).toBe(keys);

        // a new binding number after the list was built rebuilds it, still ascending
        bindGroup.setResource(source.style, 1);

        expect(bindGroup._resourceKeys).toEqual([0, 1, 3]);
    });

    it('stamps the textures it binds for the GC and leaves the samplers alone', () =>
    {
        const source = new TextureSource({ width: 2, height: 2 });
        const style = new TextureStyle();
        const bindGroup = new BindGroup({ 0: source, 1: style });

        bindGroup._touch(42);

        expect(source._gcLastUsed).toBe(42);
        expect(style).not.toHaveProperty('_gcLastUsed');

        // after a binding changes type, _touch stamps what it holds now
        const other = new TextureSource({ width: 2, height: 2 });

        bindGroup.setResource(other, 1);
        bindGroup._touch(43);

        expect(other._gcLastUsed).toBe(43);
        expect(source._gcLastUsed).toBe(43);

        bindGroup.destroy();
        source.destroy();
        other.destroy();
        style.destroy();
    });

    it('keeps its key and cached GPU bind group when a binding moves to a resource with the same id', () =>
    {
        const source = new TextureSource({ width: 2, height: 2 });
        const linear = new TextureStyle({ scaleMode: 'linear' });
        const linearToo = new TextureStyle({ scaleMode: 'linear' });
        const nearest = new TextureStyle({ scaleMode: 'nearest' });

        expect(linearToo._resourceId).toBe(linear._resourceId);

        const bindGroup = new BindGroup({ 0: source, 1: linear });
        const key = keyOf(bindGroup);
        const entry = {} as BindGroup['_gpuEntry'];

        bindGroup._gpuEntry = entry;
        bindGroup.setResource(linearToo, 1);

        expect(bindGroup.getResource(1)).toBe(linearToo);
        // equal settings resolve to one GPUSampler, so the key and the entry don't change
        expect(keyOf(bindGroup)).toBe(key);
        expect(bindGroup._gpuEntry).toBe(entry);

        bindGroup.setResource(nearest, 1);

        expect(keyOf(bindGroup)).not.toBe(key);
        expect(bindGroup._gpuEntry).toBeNull();

        bindGroup.destroy();
        source.destroy();
        linear.destroy();
        linearToo.destroy();
        nearest.destroy();
    });
});
