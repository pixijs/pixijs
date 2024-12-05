import { BlurFilter } from '../BlurFilter';

describe('BlurFilter', () =>
{
    it('should construct filter', () =>
    {
        const filter = new BlurFilter();

        expect(filter).toBeInstanceOf(BlurFilter);
        expect(filter.strength).toEqual(8);
        expect(filter.strengthX).toEqual(8);
        expect(filter.strengthY).toEqual(8);
        expect(filter.quality).toEqual(4);

        // Deprecated properties
        expect(filter.blur).toEqual(8);
        expect(filter.blurX).toEqual(8);
        expect(filter.blurY).toEqual(8);

        filter.destroy();
    });

    it('should support strength args', () =>
    {
        const filter = new BlurFilter({ strength: 10 });

        expect(filter).toBeInstanceOf(BlurFilter);
        expect(filter.strength).toEqual(10);
        expect(filter.strengthX).toEqual(10);
        expect(filter.strengthY).toEqual(10);

        filter.destroy();
    });

    it('should support X/Y strength args', () =>
    {
        const filter = new BlurFilter({ strength: 8, strengthX: 15, strengthY: 20 });

        expect(filter).toBeInstanceOf(BlurFilter);
        expect(() => filter.strength).toThrow();
        expect(filter.strengthX).toEqual(15);
        expect(filter.strengthY).toEqual(20);

        filter.destroy();
    });

    it('should support repeatEdgePixels', () =>
    {
        const filter = new BlurFilter();

        expect(filter.repeatEdgePixels).toBe(false);
        expect(filter.padding).toBeGreaterThan(0);

        filter.repeatEdgePixels = true;

        expect(filter.repeatEdgePixels).toBe(true);
        expect(filter.padding).toEqual(0);

        filter.destroy();
    });
});
