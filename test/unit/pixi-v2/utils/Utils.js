describe('Utils', function () {
    'use strict';

    var expect = chai.expect;

    it('requestAnimationFrame exists', function () {
        expect(global).to.respondTo('requestAnimationFrame');
    });

    it('cancelAnimationFrame exists', function () {
        expect(global).to.respondTo('cancelAnimationFrame');
    });

    it('requestAnimFrame exists', function () {
        expect(global).to.respondTo('requestAnimFrame');
    });
});
