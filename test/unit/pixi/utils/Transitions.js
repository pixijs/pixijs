describe('Utils', function () {
    'use strict';

    var expect = chai.expect;
    var T = PIXI.Transitions;

    it('ease functions', function () {
        expect(T.easeIn(0.5)).to.equal(0.125, 'Ease In of 0.5 should be 0.125');
        expect(T.getTransition(T.EASE_IN)(0.5)).to.equal(0.125, 'Ease Function should be found properly');
    });
});
