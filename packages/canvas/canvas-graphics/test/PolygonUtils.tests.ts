import { PolygonUtils } from '../src/utils/PolygonUtils';
import { expect } from 'chai';

describe('PolygonUtils', function ()
{
    it('isPolygonClockwise', function ()
    {
        const ccwTriangle1 = [0, 0, 1, 0, 0, 1];
        const ccwTriangle2 = [1, 0, 0, 1, 0, 0];
        const ccwTriangle3 = [0, 1, 0, 0, 1, 0];
        const cwTriangle1 = [0, 1, 1, 0, 0, 0];
        const cwTriangle2 = [1, 0, 0, 0, 0, 1];
        const cwTriangle3 = [0, 0, 0, 1, 1, 0];
        const ccwSquare1 = [0, 0, 1, 0, 1, 1, 0, 1];
        const ccwSquare2 = [1, 0, 1, 1, 0, 1, 0, 0];
        const ccwSquare3 = [1, 1, 0, 1, 0, 0, 1, 0];
        const ccwSquare4 = [0, 1, 0, 0, 1, 0, 1, 1];
        const cwSquare1 = [0, 1, 1, 1, 1, 0, 0, 0];
        const cwSquare2 = [1, 1, 1, 0, 0, 0, 0, 1];
        const cwSquare3 = [1, 0, 0, 0, 0, 1, 1, 1];
        const cwSquare4 = [0, 0, 0, 1, 1, 1, 1, 0];

        expect(PolygonUtils.isPolygonClockwise(cwTriangle1)).to.be.true;
        expect(PolygonUtils.isPolygonClockwise(cwTriangle2)).to.be.true;
        expect(PolygonUtils.isPolygonClockwise(cwTriangle3)).to.be.true;
        expect(PolygonUtils.isPolygonClockwise(cwSquare1)).to.be.true;
        expect(PolygonUtils.isPolygonClockwise(cwSquare2)).to.be.true;
        expect(PolygonUtils.isPolygonClockwise(cwSquare3)).to.be.true;
        expect(PolygonUtils.isPolygonClockwise(cwSquare4)).to.be.true;
        expect(PolygonUtils.isPolygonClockwise(ccwTriangle1)).to.be.false;
        expect(PolygonUtils.isPolygonClockwise(ccwTriangle2)).to.be.false;
        expect(PolygonUtils.isPolygonClockwise(ccwTriangle3)).to.be.false;
        expect(PolygonUtils.isPolygonClockwise(ccwSquare1)).to.be.false;
        expect(PolygonUtils.isPolygonClockwise(ccwSquare2)).to.be.false;
        expect(PolygonUtils.isPolygonClockwise(ccwSquare3)).to.be.false;
        expect(PolygonUtils.isPolygonClockwise(ccwSquare4)).to.be.false;
    });
});
