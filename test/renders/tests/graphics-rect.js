'use strict';

module.exports = function ()
{
    this.stage.addChild(new PIXI.Graphics()
        .beginFill(0xFFCC00, 1)
        .drawRect(8, 8, 16, 16)
    );
};
