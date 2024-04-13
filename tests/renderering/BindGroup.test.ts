import { BindGroup } from '../../src/rendering/renderers/gpu/shader/BindGroup';
import { Buffer } from '../../src/rendering/renderers/shared/buffer/Buffer';
import { BufferResource } from '../../src/rendering/renderers/shared/buffer/BufferResource';
import { BufferUsage } from '../../src/rendering/renderers/shared/buffer/const';
import { UniformGroup } from '../../src/rendering/renderers/shared/shader/UniformGroup';
import { RenderTexture } from '../../src/rendering/renderers/shared/texture/RenderTexture';
import { TextureSource } from '../../src/rendering/renderers/shared/texture/sources/TextureSource';
import { TextureStyle } from '../../src/rendering/renderers/shared/texture/TextureStyle';
import { resetUids } from '../../src/utils/data/uid';

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

    it('should release destroyed resources', () =>
    {
        const buffer = new Buffer({
            data: new Float32Array(100),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        const texture = RenderTexture.create({
            width: 10,
            height: 10,
        });

        const style = new TextureStyle();

        const bufferResource = new BufferResource({
            buffer,
            offset: 100,
            size: 200
        });

        const bindGroup = new BindGroup({
            0: bufferResource,
            1: texture.source,
            2: style,
        });

        bufferResource.destroy();

        expect(bindGroup.resources[0]).toBeNull();

        texture.source.destroy();

        expect(bindGroup.resources[1]).toBeNull();

        style.destroy();

        expect(bindGroup.resources[2]).toBeNull();
    });
});
