'use strict';
var core = require('../core');

var tempPoint = new core.math.Point();

core.DisplayObject.prototype.interactive = false;
core.DisplayObject.prototype.buttonMode = false;
core.DisplayObject.prototype.interactiveChildren = true;
core.DisplayObject.prototype.defaultCursor = 'pointer';

// some internal checks..
core.DisplayObject.prototype._over = false;
core.DisplayObject.prototype._touchDown = false;

core.Sprite.prototype.hitTest = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var width = this._texture._frame.width;
    var height = this._texture._frame.height;
    var x1 = -width * this.anchor.x;
    var y1;

    if ( tempPoint.x > x1 && tempPoint.x < x1 + width )
    {
        y1 = -height * this.anchor.y;

        if ( tempPoint.y > y1 && tempPoint.y < y1 + height )
        {
            return true;
        }
    }

    return false;
};


core.Graphics.prototype.hitTest = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var graphicsData = this.graphicsData;

    for (var i = 0; i < graphicsData.length; i++)
    {
        var data = graphicsData[i];

        if (!data.fill)
        {
            continue;
        }

        // only deal with fills..
        if (data.shape)
        {
            if ( data.shape.contains( tempPoint.x, tempPoint.y ) )
            {
                return true;
            }
        }
    }

    return false;
};

module.exports = {};
