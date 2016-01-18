var math = require('../math');
var ObservablePoint = require('./ObservablePoint');

/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
function Transform()
{
    this.worldTransform = new math.Matrix();
    this.localTransform = new math.Matrix();

    this.position = new ObservablePoint(this, 0);
    this.scale = new ObservablePoint(this,1, 1);
    this.pivot = new ObservablePoint(this, 0, 0);
    this.skew = new ObservablePoint(this, 0,0);
    
    this.rotation = 0;
    this._sr = Math.sin(0);
    this._cr = Math.cos(0);
    
    this.dirty = true;


    this.updated = true;
}

Transform.prototype.constructor = Transform;

Transform.prototype.updateTransform = function (parentTransform)
{
    var pt = parentTransform.worldTransform;
    var wt = this.worldTransform;
    var lt = this.localTransform;

    if(this.dirty)
    {
        // get the matrix values of the displayobject based on its transform properties..
        lt.a  =  this._cr * this.scale._x;
        lt.b  =  this._sr * this.scale._x;
        lt.c  = -this._sr * this.scale._y;
        lt.d  =  this._cr * this.scale._y;
        lt.tx =  this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
        lt.ty =  this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
    }

    this.updated = this.dirty || parentTransform.dirty;

    if(this.updated)
    {      
        // concat the parent matrix with the objects transform.
        wt.a  = lt.a  * pt.a + lt.b  * pt.c;
        wt.b  = lt.a  * pt.b + lt.b  * pt.d;
        wt.c  = lt.c  * pt.a + lt.d  * pt.c;
        wt.d  = lt.c  * pt.b + lt.d  * pt.d;
        wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
        wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
    }
  
}

module.exports = Transform;


