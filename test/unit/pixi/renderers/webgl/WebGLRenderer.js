describe('renderers/webgl/WebGLRenderer', function () {
    'use strict';

    var expect = chai.expect;
    var WebGLRenderer = PIXI.WebGLRenderer;

    it('Module exists', function () {
        expect(WebGLRenderer).to.be.a('function');
    });

    // Skip tests if WebGL is not available (Travis CI)
    var describeCond = window.WebGLRenderingContext ? describe : describe.skip;
    var itCond = window.WebGLRenderingContext ? it : it.skip;

    itCond('Destroy renderer', function () {
        var renderer = new PIXI.WebGLRenderer(400, 300, {});
        renderer.destroy();
    });

    describeCond('.autoResize', function () {
        it('Should automatically resize view if enabled', function () {
            var renderer = new WebGLRenderer(200, 200, {
                autoResize: true
            });

            expect(renderer.view.style.width).to.equal('200px');
        });

        it('Should not automatically resize view if disabled', function () {
            var renderer = new WebGLRenderer(200, 200, {
                autoResize: false
            });

            expect(renderer.view.style.width).to.equal('');
        });

        it('Should not automatically resize view if not specified', function () {
            var renderer = new WebGLRenderer(200, 200, {
                resolution: 2
            });

            expect(renderer.view.style.width).to.equal('');
        });
    });
});
