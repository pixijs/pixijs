import { BlurFilter } from '@pixi/filter-blur';
import { expect } from 'chai';

describe('BlurFilter', function ()
{
    it('should construct filter', function ()
    {
        const filter = new BlurFilter();

        expect(filter).to.be.instanceOf(BlurFilter);
        expect(filter.blur).to.equal(8);
        expect(filter.blurX).to.equal(8);
        expect(filter.blurY).to.equal(8);
        expect(filter.quality).to.equal(4);

        filter.destroy();
    });

    it('should support repeatEdgePixels', function ()
    {
        const filter = new BlurFilter();

        expect(filter.repeatEdgePixels).to.be.false;
        expect(filter.padding).to.be.greaterThan(0);

        filter.repeatEdgePixels = true;

        expect(filter.repeatEdgePixels).to.be.true;
        expect(filter.padding).to.equal(0);

        filter.destroy();
    });
});
