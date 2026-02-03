import { AlphaFilter } from '../AlphaFilter';

describe('AlphaFilter', () =>
{
    it('should construct filter', () =>
    {
        const filter = new AlphaFilter();

        expect(filter).toBeInstanceOf(AlphaFilter);
        expect(filter.alpha).toEqual(1);

        filter.destroy();
    });

    it('should allow alpha to be set', () =>
    {
        const filter = new AlphaFilter();

        filter.alpha = 0.5;

        expect(filter.alpha).toEqual(0.5);

        filter.destroy();
    });
});
