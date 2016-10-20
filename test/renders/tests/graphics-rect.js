'use strict';

module.exports = function ()
{
    const graphic = new PIXI.Graphics()
        .beginFill(0xFFCC00, 1)
        .drawRect(8, 8, 16, 16);

    assert.equal(graphic.width, 16);
    assert.equal(graphic.height, 16);
    assert.equal(graphic.x, 0);
    assert.equal(graphic.y, 0);

    const bounds = graphic.getBounds();

    assert.equal(bounds.x, 8);
    assert.equal(bounds.y, 8);
    assert.equal(bounds.width, 16);
    assert.equal(bounds.height, 16);

    this.stage.addChild(graphic);
};
