'use strict';

const withGL = require('../withGL');

describe('PIXI.WebGLRenderer', function ()
{
    it('setting option legacy should disable VAOs and SPRITE_MAX_TEXTURES', withGL(
        function ()
        {
            return new PIXI.WebGLRenderer(1, 1, { legacy: true });
        },
        function (renderer)
        {
            expect(PIXI.glCore.VertexArrayObject.FORCE_NATIVE).to.equal(true);
            expect(renderer.plugins.sprite.MAX_TEXTURES).to.equal(1);
        }));
});
