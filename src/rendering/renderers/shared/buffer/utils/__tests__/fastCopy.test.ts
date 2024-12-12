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
});
