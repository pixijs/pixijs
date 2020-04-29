const { GlyphTiles } = require('../');
const { Rectangle } = require('@pixi/math');
const expect = require('chai').expect;

describe('module:@pixi/text.GlyphTiles', function ()
{
    it('should return one blank tile-rect when newly created', function ()
    {
        const glyphTiles = new GlyphTiles(5, 5);
        const tileRects = glyphTiles.getBlankTileRects();

        expect(tileRects.length).to.equal(1);

        const rect = tileRects[0];

        expect(rect.x).to.equal(0);
        expect(rect.y).to.equal(0);
        expect(rect.width).to.equal(5);
        expect(rect.height).to.equal(5);
    });

    it('should return two tile-rects after taking a corner-rectangle', function ()
    {
        const glyphTiles = new GlyphTiles(32, 32);

        glyphTiles.reserveTileRect(new Rectangle(0, 0, 1, 1));

        const rects = glyphTiles.getBlankTileRects();

        expect(rects.length).to.equal(2);
    });
});
