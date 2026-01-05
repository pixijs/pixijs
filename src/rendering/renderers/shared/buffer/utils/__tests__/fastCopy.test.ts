import { fastCopy } from '../fastCopy';

describe('fastCopy', () =>
{
    it('should copy from one array to another correctly', () =>
    {
        const source = new Float32Array([1, 2, 3, 4]);
        const destination = new Float32Array(4);

        fastCopy(source.buffer, destination.buffer);

        expect(destination[0]).toBe(1);
        expect(destination[1]).toBe(2);
        expect(destination[2]).toBe(3);
        expect(destination[3]).toBe(4);
    });

    it('should copy from one array to another correctly when source is smaller', () =>
    {
        const source = new Float32Array([1, 2, 3, 4]);
        const destination = new Float32Array(8);

        fastCopy(source.buffer, destination.buffer);

        expect(destination[0]).toBe(1);
        expect(destination[1]).toBe(2);
        expect(destination[2]).toBe(3);
        expect(destination[3]).toBe(4);
    });

    it('should copy over when an array does line up to 64bits', () =>
    {
        const source = new Float32Array([1, 2, 3, 4, 5]);
        const destination = new Float32Array(5);

        fastCopy(source.buffer, destination.buffer);

        expect(destination[0]).toBe(1);
        expect(destination[1]).toBe(2);
        expect(destination[2]).toBe(3);
        expect(destination[3]).toBe(4);
        expect(destination[4]).toBe(5);
    });

    it('should copy correctly when source is larger than destination', () =>
    {
        const source = new Float32Array([1, 2, 3, 4]); // 16 bytes
        const destination = new Float32Array(2); // 8 bytes

        fastCopy(source.buffer, destination.buffer);

        expect(destination[0]).toBe(1);
        expect(destination[1]).toBe(2);
    });

    it('should copy correctly when source is smaller than destination', () =>
    {
        const source = new Float32Array([1, 2]); // 8 bytes
        const destination = new Float32Array(4); // 16 bytes

        fastCopy(source.buffer, destination.buffer);

        expect(destination[0]).toBe(1);
        expect(destination[1]).toBe(2);
        expect(destination[2]).toBe(0);
        expect(destination[3]).toBe(0);
    });

    it('should copy correctly with sourceOffset (8-byte aligned)', () =>
    {
        const source = new Float32Array([1, 2, 3, 4, 5, 6]); // 24 bytes
        const destination = new Float32Array(2); // 8 bytes

        // Skip first 8 bytes (2 floats), copy next 8 bytes
        fastCopy(source.buffer, destination.buffer, 8, 8);

        expect(destination[0]).toBe(3);
        expect(destination[1]).toBe(4);
    });

    it('should copy correctly with sourceOffset (non 8-byte aligned)', () =>
    {
        const source = new Float32Array([1, 2, 3, 4, 5]); // 20 bytes
        const destination = new Float32Array(2); // 8 bytes

        // Skip first 4 bytes (1 float), copy next 8 bytes
        fastCopy(source.buffer, destination.buffer, 4, 8);

        expect(destination[0]).toBe(2);
        expect(destination[1]).toBe(3);
    });

    it('should copy from a TypedArray view with byteOffset', () =>
    {
        // Simulate a view into a larger buffer (like buffer.data in PixiJS)
        const fullBuffer = new ArrayBuffer(32);
        const fullView = new Float32Array(fullBuffer);

        fullView.set([0, 0, 1, 2, 3, 4, 0, 0]); // 8 floats = 32 bytes

        // Create a view starting at byte 8 (skipping first 2 floats)
        const partialView = new Float32Array(fullBuffer, 8, 4); // [1, 2, 3, 4]

        const destination = new Float32Array(4);

        fastCopy(partialView.buffer, destination.buffer, partialView.byteOffset, partialView.byteLength);

        expect(destination[0]).toBe(1);
        expect(destination[1]).toBe(2);
        expect(destination[2]).toBe(3);
        expect(destination[3]).toBe(4);
    });

    it('should use Float32Array path for 4-byte aligned data (not 8-byte aligned)', () =>
    {
        // 12 bytes = 3 floats, 4-byte aligned but not 8-byte aligned
        const source = new Float32Array([1, 2, 3]);
        const destination = new Float32Array(3);

        fastCopy(source.buffer, destination.buffer);

        expect(destination[0]).toBe(1);
        expect(destination[1]).toBe(2);
        expect(destination[2]).toBe(3);
    });

    it('should use Float32Array path with 4-byte aligned offset', () =>
    {
        const source = new Float32Array([1, 2, 3, 4, 5, 6, 7]); // 28 bytes
        const destination = new Float32Array(3); // 12 bytes

        // Skip first 4 bytes (1 float), copy 12 bytes (3 floats)
        // Offset 4 is 4-byte aligned but not 8-byte aligned
        fastCopy(source.buffer, destination.buffer, 4, 12);

        expect(destination[0]).toBe(2);
        expect(destination[1]).toBe(3);
        expect(destination[2]).toBe(4);
    });

    it('should fall back to Uint8Array for unaligned data', () =>
    {
        // Create buffers with odd byte lengths
        const source = new Uint8Array([1, 2, 3, 4, 5]);
        const destination = new Uint8Array(5);

        fastCopy(source.buffer, destination.buffer);

        expect(destination[0]).toBe(1);
        expect(destination[1]).toBe(2);
        expect(destination[2]).toBe(3);
        expect(destination[3]).toBe(4);
        expect(destination[4]).toBe(5);
    });
});
