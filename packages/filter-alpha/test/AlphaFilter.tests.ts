import { AlphaFilter } from '@pixi/filter-alpha';
import { expect } from 'chai';

describe('AlphaFilter', () =>
{
    it('should construct filter', () =>
    {
        const filter = new AlphaFilter();

        expect(filter).to.be.instanceOf(AlphaFilter);
        expect(filter.alpha).to.equal(1);

        filter.destroy();
    });

    it('should allow alpha to be set', () =>
    {
        const filter = new AlphaFilter();

        filter.alpha = 0.5;

        expect(filter.alpha).to.equal(0.5);

        filter.destroy();
    });
});
