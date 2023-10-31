import { BlurFilter } from '../../src/filters/defaults/blur/BlurFilter';

describe('BlurFilter', () =>
{
    it('should construct filter', () =>
    {
        const filter = new BlurFilter();

        expect(filter).toBeInstanceOf(BlurFilter);
        expect(filter.blur).toEqual(8);
        expect(filter.blurX).toEqual(8);
        expect(filter.blurY).toEqual(8);
        expect(filter.quality).toEqual(4);

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
