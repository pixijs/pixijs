import { AnimatedGIFSource } from '../AnimatedGIFSource';
import { toArrayBuffer } from '@test-utils';

describe('AnimatedGIFSource', () =>
{
    describe('fromBuffer()', () =>
    {
        it('should return an instance of AnimatedGIF', () =>
        {
            const arrayBuffer = toArrayBuffer('gif/example.gif');
            const data = AnimatedGIFSource.fromBuffer(arrayBuffer);

            expect(data).toBeInstanceOf(AnimatedGIFSource);
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
            expect(() => (AnimatedGIFSource as any).fromBuffer()).toThrow();
            // eslint-disable-next-line jest/expect-expect
            expect(() => (AnimatedGIFSource as any).fromBuffer(new ArrayBuffer(0))).toThrow();
        });
    });
});
