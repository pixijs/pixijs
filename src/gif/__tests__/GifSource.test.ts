import { GifSource } from '../GifSource';
import { toArrayBuffer } from '@test-utils';

describe('GifSource', () =>
{
    describe('from()', () =>
    {
        it('should return an instance of GifSprite', () =>
        {
            const arrayBuffer = toArrayBuffer('gif/example.gif');
            const data = GifSource.from(arrayBuffer);

            expect(data).toBeInstanceOf(GifSource);
            expect(data.totalFrames).toBeGreaterThan(0);
            expect(data.width).toBeGreaterThan(0);
            expect(data.height).toBeGreaterThan(0);
            expect(data.duration).toBeGreaterThan(0);
            expect(data.frames).toBeDefined();
            expect(data.textures).toBeDefined();

            data.destroy();

            expect(data.frames).toBe(null);
            expect(data.textures).toBe(null);
            expect(data.duration).toBe(0);
            expect(data.totalFrames).toBe(0);
            expect(data.width).toBe(0);
            expect(data.height).toBe(0);
        });

        it('should throw an error if missing', () =>
        {
            // eslint-disable-next-line jest/expect-expect
            expect(() => (GifSource as any).from()).toThrow();
            // eslint-disable-next-line jest/expect-expect
            expect(() => (GifSource as any).from(new ArrayBuffer(0))).toThrow();
        });
    });
});
