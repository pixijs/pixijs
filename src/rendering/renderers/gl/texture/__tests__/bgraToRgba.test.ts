import { bgraToRgba, isBgraFormat } from '../utils/bgraToRgba';

describe('bgraToRgba', () =>
{
    it('should swap the first and third byte of every texel', () =>
    {
        const bgra = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

        expect(Array.from(bgraToRgba(bgra))).toEqual([3, 2, 1, 4, 7, 6, 5, 8]);
        expect(Array.from(bgra)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should swap texels that start at an offset that is not a multiple of 4', () =>
    {
        const bgra = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]).subarray(1);

        expect(Array.from(bgraToRgba(bgra))).toEqual([3, 2, 1, 4, 7, 6, 5, 8]);
    });

    it('should copy the bytes after the last whole texel as they are', () =>
    {
        expect(Array.from(bgraToRgba(new Uint8Array([1, 2, 3, 4, 9])))).toEqual([3, 2, 1, 4, 9]);
    });

    it('should swap an ArrayBuffer', () =>
    {
        expect(Array.from(bgraToRgba(new Uint8Array([1, 2, 3, 4]).buffer))).toEqual([3, 2, 1, 4]);
    });

    it('should reuse one buffer for every swap up to 1 MiB', () =>
    {
        const first = bgraToRgba(new Uint8Array(256 * 256 * 4)).buffer;

        expect(bgraToRgba(new Uint8Array(256 * 256 * 4)).buffer).toBe(first);
        expect(bgraToRgba(new Uint8Array(64)).buffer).toBe(first);
    });

    it('should give a swap over 1 MiB a buffer of its own and keep the shared one', () =>
    {
        const shared = bgraToRgba(new Uint8Array(1024 * 1024)).buffer;
        const large = bgraToRgba(new Uint8Array((1024 * 1024) + 4)).buffer;

        expect(large).not.toBe(shared);
        expect(bgraToRgba(new Uint8Array((1024 * 1024) + 4)).buffer).not.toBe(large);
        expect(bgraToRgba(new Uint8Array(1024 * 1024)).buffer).toBe(shared);
    });

    it('should report the BGRA formats', () =>
    {
        expect(isBgraFormat('bgra8unorm')).toBe(true);
        expect(isBgraFormat('bgra8unorm-srgb')).toBe(true);
        expect(isBgraFormat('rgba8unorm')).toBe(false);
    });
});
