'use strict';
var halfPI = Math.PI / 2,
    x, y;

function TextureUvs()
{
    this.x0 = 0;
    this.y0 = 0;

    this.x1 = 0;
    this.y1 = 0;

    this.x2 = 0;
    this.y2 = 0;

    this.x3 = 0;
    this.y3 = 0;
}

module.exports = TextureUvs;

TextureUvs.prototype.set = function (frame, baseFrame, rotate)
{
    var tw = baseFrame.width;
    var th = baseFrame.height;

    if(rotate)
    {
        this.x0 = (frame.x + frame.height) / tw;
        this.y0 = frame.y / th;

        this.x1 = (frame.x + frame.height) / tw;
        this.y1 = (frame.y + frame.width) / th;

        this.x2 = frame.x / tw;
        this.y2 = (frame.y + frame.width) / th;

        this.x3 = frame.x / tw;
        this.y3 = frame.y / th;
    }
    else
    {

        this.x0 = frame.x / tw;
        this.y0 = frame.y / th;

        this.x1 = (frame.x + frame.width) / tw;
        this.y1 = frame.y / th;

        this.x2 = (frame.x + frame.width) / tw;
        this.y2 = (frame.y + frame.height) / th;

        this.x3 = frame.x / tw;
        this.y3 = (frame.y + frame.height) / th;
    }
}
