var math = require('../math');


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

    this.position = new math.Point(0.0);
    this.scale = new math.Point(1,1);
    this.pivot = new math.Point(0.0);
    this.skew = new math.Point(0.0);
    
    this.rotation = 0;
    this._sr = Math.sin(0);
    this._cr = Math.cos(0);
    

    this.dirty = true;
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
        
        lt.tx =  this.position.x;
        lt.ty =  this.position.y;
    }

    if(this.dirty || parent.dirty)
    {      
        wt.tx = lt.tx;
        wt.ty = lt.ty;
    
   //     this.dirty = false;
     //   return true;
    }

//    this.dirty = false;
  //  return false;
}

module.exports = Transform;


