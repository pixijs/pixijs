'use strict';

describe('SpriteRenderer', () =>
{
    it('can be destroyed', () =>
    {
        const webgl = new PIXI.WebGLRenderer(20, 20);
        const renderer = new PIXI.SpriteRenderer(webgl);

        renderer.onContextChange();

        expect(() => renderer.destroy()).to.not.throw();
    });
});
