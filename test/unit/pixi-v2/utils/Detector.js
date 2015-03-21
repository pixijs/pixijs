describe('pixi/utils/Detector', function () {
    'use strict';

    var expect = chai.expect;
    var autoDetectRenderer = PIXI.autoDetectRenderer;

    it('Module exists', function () {
        expect(autoDetectRenderer).to.be.a('function');
    });
});
