import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { expect } from 'chai';

describe('ColorMatrixFilter', function ()
{
    it('should construct filter', function ()
    {
        const filter = new ColorMatrixFilter();

        expect(filter).to.be.instanceOf(ColorMatrixFilter);
        expect(filter.alpha).to.equal(1);

        filter.alpha = 0.5;

        expect(filter.alpha).to.equal(0.5);
        expect(filter.matrix).to.deep.eq(new Float32Array(
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]
        ));

        filter.destroy();
    });

    it('should run all operations without multiply', function ()
    {
        const filter = new ColorMatrixFilter();

        filter.brightness(0.5, false);
        filter.tint(0xff0000, false);
        filter.greyscale(0.5, false);
        filter.blackAndWhite(false);
        filter.hue(120, false);
        filter.contrast(0.5, false);
        filter.saturate(1, false);
        filter.desaturate();
        filter.negative(false);
        filter.sepia(false);
        filter.technicolor(false);
        filter.polaroid(false);
        filter.toBGR(false);
        filter.kodachrome(false);
        filter.browni(false);
        filter.vintage(false);
        filter.colorTone(0.2, 0.14, 0xffffff, 0x0, false);
        filter.night(1, false);
        filter.predator(1, false);
        filter.lsd(false);
        filter.reset();

        filter.destroy();
    });

    it('should run all operations with multiply', function ()
    {
        const filter = new ColorMatrixFilter();

        filter.brightness(0.5, true);
        filter.tint(0xff0000, true);
        filter.greyscale(0.5, true);
        filter.blackAndWhite(true);
        filter.hue(120, true);
        filter.contrast(0.5, true);
        filter.saturate(1, true);
        filter.desaturate();
        filter.negative(true);
        filter.sepia(true);
        filter.technicolor(true);
        filter.polaroid(true);
        filter.toBGR(true);
        filter.kodachrome(true);
        filter.browni(true);
        filter.vintage(true);
        filter.colorTone(0.2, 0.14, 0xffffff, 0x0, true);
        filter.night(1, true);
        filter.predator(1, true);
        filter.lsd(true);
        filter.reset();

        filter.destroy();
    });
});
