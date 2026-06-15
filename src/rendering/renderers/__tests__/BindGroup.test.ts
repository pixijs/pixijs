import { BindGroup } from '../gpu/shader/BindGroup';
import { Buffer } from '../shared/buffer/Buffer';
import { BufferResource } from '../shared/buffer/BufferResource';
import { BufferUsage } from '../shared/buffer/const';
import { UniformGroup } from '../shared/shader/UniformGroup';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { TextureStyle } from '../shared/texture/TextureStyle';
import { itLocalOnly } from '@test-utils';
import { resetUids } from '~/utils';

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

        const bindGroupKey = bindGroup._key;

        buffer.data = new Float32Array(200);

        expect(bindGroupKey).not.toBe(bindGroup._key);
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

        const bindGroupKey = bindGroup._key;

        buffer.data = new Float32Array(200);

        expect(bindGroupKey).not.toBe(bindGroup._key);
    });

    it('should let have a unique id for a bind group, no clashes', () =>
    {
        resetUids();

        const group1 = new UniformGroup({
            test: { value: 1, type: 'f32' }
        });

        const bindGroup1 = new BindGroup({
            0: group1,
        });

        expect(bindGroup1._key).toBe('0');

        const texture = new TextureSource();

        const bindGroup2 = new BindGroup({
            0: texture,
        });

        expect(bindGroup2._key).toBe('1');

        const style = new TextureStyle();

        const bindGroup3 = new BindGroup({
            0: style,
        });

        expect(bindGroup3._key).toBe('2');
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

        bufferResource.destroy();

        // the group survives with a null slot, and every consumer must tolerate it
        expect(bindGroup.resources[0]).toBeNull();
        expect(() => bindGroup._key).not.toThrow();
        expect(bindGroup._key).toBe('-1');
        expect(() => bindGroup._touch(0, 0)).not.toThrow();
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

        source.destroy();

        expect(bindGroup.resources[0]).toBeNull();
        expect(() => bindGroup._key).not.toThrow();
        expect(bindGroup._key).toBe('-1');
        expect(() => bindGroup._touch(0, 0)).not.toThrow();
    });
});
