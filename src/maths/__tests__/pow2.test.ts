import { isPow2, log2, nextPow2 } from '../misc/pow2';

describe('pow2', () =>
{
    describe('nextPow2', () =>
    {
        it('should return the next power of two for regular values', () =>
        {
            expect(nextPow2(1)).toEqual(1);
            expect(nextPow2(2)).toEqual(2);
            expect(nextPow2(3)).toEqual(4);
            expect(nextPow2(4)).toEqual(4);
            expect(nextPow2(5)).toEqual(8);
            expect(nextPow2(7)).toEqual(8);
            expect(nextPow2(8)).toEqual(8);
            expect(nextPow2(9)).toEqual(16);
        });

        it('should handle zero', () =>
        {
            expect(nextPow2(0)).toEqual(1);
        });

        it('should handle large values', () =>
        {
            expect(nextPow2(255)).toEqual(256);
            expect(nextPow2(256)).toEqual(256);
            expect(nextPow2(257)).toEqual(512);
            expect(nextPow2(1023)).toEqual(1024);
            expect(nextPow2(1024)).toEqual(1024);
            expect(nextPow2(1025)).toEqual(2048);
        });

        it('should handle powers of two exactly', () =>
        {
            expect(nextPow2(16)).toEqual(16);
            expect(nextPow2(32)).toEqual(32);
            expect(nextPow2(64)).toEqual(64);
            expect(nextPow2(128)).toEqual(128);
            expect(nextPow2(512)).toEqual(512);
            expect(nextPow2(4096)).toEqual(4096);
        });
    });

    describe('isPow2', () =>
    {
        it('should return true for powers of two', () =>
        {
            expect(isPow2(1)).toBe(true);
            expect(isPow2(2)).toBe(true);
            expect(isPow2(4)).toBe(true);
            expect(isPow2(8)).toBe(true);
            expect(isPow2(16)).toBe(true);
            expect(isPow2(32)).toBe(true);
            expect(isPow2(64)).toBe(true);
            expect(isPow2(128)).toBe(true);
            expect(isPow2(256)).toBe(true);
            expect(isPow2(512)).toBe(true);
            expect(isPow2(1024)).toBe(true);
            expect(isPow2(2048)).toBe(true);
            expect(isPow2(4096)).toBe(true);
        });

        it('should return false for non-powers of two', () =>
        {
            expect(isPow2(0)).toBe(false);
            expect(isPow2(3)).toBe(false);
            expect(isPow2(5)).toBe(false);
            expect(isPow2(6)).toBe(false);
            expect(isPow2(7)).toBe(false);
            expect(isPow2(9)).toBe(false);
            expect(isPow2(10)).toBe(false);
            expect(isPow2(15)).toBe(false);
            expect(isPow2(100)).toBe(false);
            expect(isPow2(255)).toBe(false);
        });
    });

    describe('log2', () =>
    {
        it('should compute ceil of log base 2', () =>
        {
            expect(log2(1)).toEqual(0);
            expect(log2(2)).toEqual(1);
            expect(log2(4)).toEqual(2);
            expect(log2(8)).toEqual(3);
            expect(log2(16)).toEqual(4);
            expect(log2(32)).toEqual(5);
            expect(log2(64)).toEqual(6);
            expect(log2(128)).toEqual(7);
            expect(log2(256)).toEqual(8);
            expect(log2(512)).toEqual(9);
            expect(log2(1024)).toEqual(10);
        });

        it('should handle non-powers of two', () =>
        {
            expect(log2(3)).toEqual(1);
            expect(log2(5)).toEqual(2);
            expect(log2(7)).toEqual(2);
            expect(log2(9)).toEqual(3);
            expect(log2(15)).toEqual(3);
            expect(log2(17)).toEqual(4);
            expect(log2(255)).toEqual(7);
        });

        it('should handle large values', () =>
        {
            expect(log2(65536)).toEqual(16);
            expect(log2(65537)).toEqual(16);
        });
    });
});
