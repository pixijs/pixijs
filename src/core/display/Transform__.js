var math = require('../math');
var mat2d = require('gl-matrix').mat2d

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
    this.worldTransform = mat2d.create();
    this.localTransform = mat2d.create();

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


//    if(this.dirty)
    {
        // get the matrix values of the displayobject based on its transform properties..
        lt[0]  =  this._cr * this.scale.x;
        lt[1]  =  this._sr * this.scale.x;
        lt[2]  = -this._sr * this.scale.y;
        lt[3]  =  this._cr * this.scale.y;
        lt[4] =  this.position.x - (this.pivot.x * lt[0] + this.pivot.y * lt[2]);
        lt[5] =  this.position.y - (this.pivot.x * lt[1] + this.pivot.y * lt[3]);
    }

    
  //if(this.dirty || parent.dirty)
    {      
      
        // concat the parent matrix with the objects transform.
        wt[0]  = lt[0]  * pt[0] + lt[1]  * pt[2];
        wt[1]  = lt[0]  * pt[1] + lt[1]  * pt[3];
        wt[2]  = lt[2]  * pt[0] + lt[3] * pt[2];
        wt[3] = lt[2]  * pt[1] + lt[3] * pt[3];
        wt[4] = lt[4] * pt[0] + lt[5] * pt[2] + pt[4];
        wt[5] = lt[4] * pt[1] + lt[5] * pt[3]+ pt[5];       
    
   //     this.dirty = false;
      //  return true;
    }

    //this.dirty = false;
//    return false;
}

module.exports = Transform;


