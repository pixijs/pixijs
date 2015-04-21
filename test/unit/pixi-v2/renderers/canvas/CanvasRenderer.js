describe('renderers/canvas/CanvasRenderer', function () {
    'use strict';

    var expect = chai.expect;
    var CanvasRenderer = PIXI.CanvasRenderer;

    it('Module exists', function () {
        expect(CanvasRenderer).to.be.a('function');
    });

    describe('.autoResize', function () {
        it('Should automatically resize view if enabled', function () {
            var renderer = new CanvasRenderer(200, 200, {
                autoResize: true
            });

            expect(renderer.view.style.width).to.equal('200px');
        });

        it('Should not automatically resize view if disabled', function () {
            var renderer = new CanvasRenderer(200, 200, {
                autoResize: false
            });

            expect(renderer.view.style.width).to.equal('');
        });

        it('Should not automatically resize view if not specified', function () {
            var renderer = new CanvasRenderer(200, 200, {
                resolution: 2
            });

            expect(renderer.view.style.width).to.equal('');
        });
    });
});
