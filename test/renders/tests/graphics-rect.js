'use strict';

module.exports = function ()
{
    const graphic = new PIXI.Graphics()
        .beginFill(0xFFCC00, 1)
        .drawRect(8, 8, 16, 16);

    expect(graphic.width).to.equal(16);
    expect(graphic.height).to.equal(16);
    expect(graphic.x).to.equal(0);
    expect(graphic.y).to.equal(0);

    const bounds = graphic.getBounds();

    expect(bounds.x).to.equal(8);
    expect(bounds.y).to.equal(8);
    expect(bounds.width).to.equal(16);
    expect(bounds.height).to.equal(16);

    this.stage.addChild(graphic);
};
