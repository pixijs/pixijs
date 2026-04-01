import { ViewableBuffer } from '../data/ViewableBuffer';

describe('ViewableBuffer', () =>
{
    describe('constructor', () =>
    {
        it('should create from a size in bytes', () =>
        {
            const buffer = new ViewableBuffer(32);

            expect(buffer.size).toEqual(32);
            expect(buffer.rawBinaryData).toBeInstanceOf(ArrayBuffer);
            expect(buffer.rawBinaryData.byteLength).toEqual(32);
        });

        it('should create from an ArrayBuffer', () =>
        {
            const arrayBuffer = new ArrayBuffer(64);
            const buffer = new ViewableBuffer(arrayBuffer);

            expect(buffer.size).toEqual(64);
            expect(buffer.rawBinaryData).toBe(arrayBuffer);
        });

        it('should create from a Uint8Array', () =>
        {
            const uint8 = new Uint8Array([1, 2, 3, 4]);
            const buffer = new ViewableBuffer(uint8);

            expect(buffer.size).toEqual(4);
        });

        it('should have float32View and uint32View available immediately', () =>
        {
            const buffer = new ViewableBuffer(16);

            expect(buffer.float32View).toBeInstanceOf(Float32Array);
            expect(buffer.uint32View).toBeInstanceOf(Uint32Array);
        });
    });

    describe('typed array views', () =>
    {
        it('should lazily create int8View', () =>
        {
            const buffer = new ViewableBuffer(16);
            const view = buffer.int8View;

            expect(view).toBeInstanceOf(Int8Array);
            expect(view.length).toEqual(16);
            // Should return same instance on second access
            expect(buffer.int8View).toBe(view);
        });

        it('should lazily create uint8View', () =>
        {
            const buffer = new ViewableBuffer(16);
            const view = buffer.uint8View;

            expect(view).toBeInstanceOf(Uint8Array);
            expect(view.length).toEqual(16);
            expect(buffer.uint8View).toBe(view);
        });

        it('should lazily create int16View', () =>
        {
            const buffer = new ViewableBuffer(16);
            const view = buffer.int16View;

            expect(view).toBeInstanceOf(Int16Array);
            expect(view.length).toEqual(8); // 16 bytes / 2 bytes per int16
            expect(buffer.int16View).toBe(view);
        });

        it('should lazily create int32View', () =>
        {
            const buffer = new ViewableBuffer(16);
            const view = buffer.int32View;

            expect(view).toBeInstanceOf(Int32Array);
            expect(view.length).toEqual(4); // 16 bytes / 4 bytes per int32
            expect(buffer.int32View).toBe(view);
        });

        it('should lazily create float64View', () =>
        {
            const buffer = new ViewableBuffer(16);
            const view = buffer.float64View;

            expect(view).toBeInstanceOf(Float64Array);
            expect(view.length).toEqual(2); // 16 bytes / 8 bytes per float64
            expect(buffer.float64View).toBe(view);
        });

        it('should lazily create bigUint64View', () =>
        {
            const buffer = new ViewableBuffer(16);
            const view = buffer.bigUint64View;

            expect(view).toBeInstanceOf(BigUint64Array);
            expect(view.length).toEqual(2); // 16 bytes / 8 bytes per BigUint64
            expect(buffer.bigUint64View).toBe(view);
        });
    });

    describe('view', () =>
    {
        it('should return the correct typed view by string name', () =>
        {
            const buffer = new ViewableBuffer(16);

            expect(buffer.view('float32')).toBe(buffer.float32View);
            expect(buffer.view('uint32')).toBe(buffer.uint32View);
            expect(buffer.view('int8')).toBe(buffer.int8View);
            expect(buffer.view('uint8')).toBe(buffer.uint8View);
            expect(buffer.view('int16')).toBe(buffer.int16View);
            expect(buffer.view('int32')).toBe(buffer.int32View);
        });
    });

    describe('data sharing across views', () =>
    {
        it('should share the underlying buffer across all views', () =>
        {
            const buffer = new ViewableBuffer(4);

            buffer.float32View[0] = 1.5;

            // The same memory should be accessible via uint32View
            expect(buffer.uint32View[0]).not.toEqual(0);
        });

        it('should allow writing and reading through different views', () =>
        {
            const buffer = new ViewableBuffer(4);

            buffer.uint8View[0] = 255;
            buffer.uint8View[1] = 0;
            buffer.uint8View[2] = 0;
            buffer.uint8View[3] = 0;

            expect(buffer.uint32View[0]).toEqual(255);
        });
    });

    describe('destroy', () =>
    {
        it('should null all references', () =>
        {
            const buffer = new ViewableBuffer(16);

            // Access some views first to ensure they are created
            const _int8 = buffer.int8View;
            const _uint8 = buffer.uint8View;
            const _int16 = buffer.int16View;
            const _int32 = buffer.int32View;
            const _float64 = buffer.float64View;
            const _bigUint64 = buffer.bigUint64View;

            buffer.destroy();

            expect(buffer.rawBinaryData).toBeNull();
            expect(buffer.uint32View).toBeNull();
            expect(buffer.float32View).toBeNull();
        });
    });

    describe('sizeOf', () =>
    {
        it('should return correct size for int8/uint8', () =>
        {
            expect(ViewableBuffer.sizeOf('int8')).toEqual(1);
            expect(ViewableBuffer.sizeOf('uint8')).toEqual(1);
        });

        it('should return correct size for int16/uint16', () =>
        {
            expect(ViewableBuffer.sizeOf('int16')).toEqual(2);
            expect(ViewableBuffer.sizeOf('uint16')).toEqual(2);
        });

        it('should return correct size for int32/uint32/float32', () =>
        {
            expect(ViewableBuffer.sizeOf('int32')).toEqual(4);
            expect(ViewableBuffer.sizeOf('uint32')).toEqual(4);
            expect(ViewableBuffer.sizeOf('float32')).toEqual(4);
        });

        it('should throw for invalid type', () =>
        {
            expect(() => ViewableBuffer.sizeOf('float64')).toThrow();
            expect(() => ViewableBuffer.sizeOf('invalid')).toThrow();
        });
    });
});
