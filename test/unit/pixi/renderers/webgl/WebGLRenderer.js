describe('renderers/webgl/WebGLRenderer', function () {
    'use strict';

    var expect = chai.expect;
    var WebGLRenderer = PIXI.WebGLRenderer;

    it('Module exists', function () {
        expect(WebGLRenderer).to.be.a('function');
    });

    // Skip tests if WebGL is not available (WebGL not supported in Travis CI)
    try {
        var renderer = new WebGLRenderer(400, 300, {});
        renderer.destroy();
    } catch (error) {
        return;
    }

    it('Destroy renderer', function () {
        var renderer = new WebGLRenderer(400, 300, {});
        renderer.destroy();
    });

    describe('.autoResize', function () {
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
