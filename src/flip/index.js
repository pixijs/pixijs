/**
 * @file       FLIP
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/GoodBoyDigital/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI
 */
module.exports = {
    Container3d    :require('./Container3d'),
    Sprite3d            :require('./Sprite3d'),
    Sprite3dRenderer    :require('./webgl/Sprite3dRenderer'),
    Graphics3d          :require('./Graphics3d'),
    Graphics3dRenderer    :require('./webgl/Graphics3dRenderer'),
};

var core             = require('../core'),
    glMat            = require('gl-matrix'),
    math3d           = require('./math'),
    temp3dTransform  = glMat.mat4.create(),
    tempQuat         = glMat.quat.create(),
    tempPoint        = new core.Point();

core.Container.prototype.worldTransform3d = null;
core.Container.prototype.depthBias = 0;
core.Container.prototype._customMatrix = null;


core.Container.prototype.displayObjectUpdateTransform3d = function()
{
    if(!this._customMatrix)
    {
        var quat = tempQuat;

        var rx = this.rotation.x;
        var ry = this.rotation.y;
        var rz = this.rotation.z;

        //TODO cach sin cos?
        var c1 = Math.cos( rx / 2 );
        var c2 = Math.cos( ry / 2 );
        var c3 = Math.cos( rz / 2 );

        var s1 = Math.sin( rx / 2 );
        var s2 = Math.sin( ry / 2 );
        var s3 = Math.sin( rz / 2 );

        quat[0] = s1 * c2 * c3 + c1 * s2 * s3;
        quat[1] = c1 * s2 * c3 - s1 * c2 * s3;
        quat[2] = c1 * c2 * s3 + s1 * s2 * c3;
        quat[3] = c1 * c2 * c3 - s1 * s2 * s3;

        temp3dTransform[0] = this.position.x;
        temp3dTransform[1] = this.position.y;
        temp3dTransform[2] = this.position.z;

        glMat.mat4.fromRotationTranslation(this.worldTransform3d, quat, temp3dTransform);

        temp3dTransform[0] = this.scale.x;
        temp3dTransform[1] = this.scale.y;
        temp3dTransform[2] = this.scale.z;

        glMat.mat4.scale( this.worldTransform3d, this.worldTransform3d, temp3dTransform);
    
        glMat.mat4.multiply(this.worldTransform3d, this.parent.worldTransform3d, this.worldTransform3d);
    
    }
    else
    {
        glMat.mat4.multiply(this.worldTransform3d, this.parent.worldTransform3d, this._customMatrix);
    }


     // multiply the alphas..
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
};

core.Container.prototype.setMatrix = function( matrix )
{
    this._customMatrix = matrix;
}

core.Container.prototype.convertFrom2dTo3d = function(parentTransform)
{
    if(!this.worldTransform3d)
    {
        this.worldTransform3d = glMat.mat4.create();
    }

    var wt = this.worldTransform;

    if(parentTransform)
    {
        this.displayObjectUpdateTransform()
        
        var wt3d = glMat.mat4.identity( this.worldTransform3d );

        wt3d[0] = wt.a;
        wt3d[1] = wt.b;

        wt3d[4] = wt.c;
        wt3d[5] = wt.d;

        wt3d[12] = wt.tx;
        wt3d[13] = wt.ty;

        return
    }

    // create some matrix refs for easy access
    var pt = this.parent.worldTransform;
    

    // temporary matrix variables
    var a, b, c, d, tx, ty;


    // so if rotation is between 0 then we can simplify the multiplication process...
    if (this.rotation % Math.PI * 2)
    {
        // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
        if (this.rotation !== this.rotationCache)
        {
            this.rotationCache = this.rotation;
            this._sr = Math.sin(this.rotation);
            this._cr = Math.cos(this.rotation);
        }

        // get the matrix values of the displayobject based on its transform properties..
        a  =  this._cr * this.scale.x;
        b  =  this._sr * this.scale.x;
        c  = -this._sr * this.scale.y;
        d  =  this._cr * this.scale.y;
        tx =  this.position.x;
        ty =  this.position.y;

        // check for pivot.. not often used so geared towards that fact!
        if (this.pivot.x || this.pivot.y)
        {
            tx -= this.pivot.x * a + this.pivot.y * c;
            ty -= this.pivot.x * b + this.pivot.y * d;
        }

        // concat the parent matrix with the objects transform.
        wt.a  = a  * pt.a + b  * pt.c;
        wt.b  = a  * pt.b + b  * pt.d;
        wt.c  = c  * pt.a + d  * pt.c;
        wt.d  = c  * pt.b + d  * pt.d;
        wt.tx = tx * pt.a + ty * pt.c + pt.tx;
        wt.ty = tx * pt.b + ty * pt.d + pt.ty;
    }
    else
    {
        // lets do the fast version as we know there is no rotation..
        a  = this.scale.x;
        b  = 0
        d  = this.scale.y;
        c  = 0;
        tx = this.position.x - this.pivot.x * a;
        ty = this.position.y - this.pivot.y * d; 

        wt.a  = a  * pt.a;
        wt.b  = a  * pt.b;
        wt.c  = d  * pt.c;
        wt.d  = d  * pt.d;
        wt.tx = tx * pt.a + ty * pt.c + pt.tx;
        wt.ty = tx * pt.b + ty * pt.d + pt.ty;    
    }

    // multiply the alphas..
    this.worldAlpha = this.alpha * this.parent.worldAlpha;

    // reset the bounds each time this is called!
    this._currentBounds = null;

    //this.displayObjectUpdateTransform();
    var wt3d = glMat.mat4.identity( this.worldTransform3d );

    wt3d[0] = a;
    wt3d[1] = b;

    wt3d[4] = c;
    wt3d[5] = d;

    wt3d[12] = tx;
    wt3d[13] = ty;
};

core.Container.prototype.updateTransform3d = function()
{
    this.convertFrom2dTo3d();

    glMat.mat4.multiply(this.worldTransform3d, this.parent.worldTransform3d, this.worldTransform3d);

    var i,j;

    for (i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform3d();
    }
};


core.Container.prototype.renderWebGL3d = function (renderer)
{
    // if the object is not visible or the alpha is 0 then no need to render this element
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
    {
        return;
    }

    // BIT of code dupliactions going on here...
    if (this._mask || this._filters)
    {
        renderer.currentRenderer.flush();

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (this._filters)
        {
            renderer.filterManager.pushFilter(this, this._filters);
        }

        if (this._mask)
        {
            renderer.maskManager.pushMask(this, this._mask);
        }

        renderer.currentRenderer.start();

        // add this object to the batch, only rendered if it has a texture.
        this._renderWebGL3d(renderer);

        // now loop through the children and make sure they get rendered
        for (i = 0, j = this.children.length; i < j; i++)
        {
            this.children[i].renderWebGL3d(renderer);
        }

        renderer.currentRenderer.flush();

        if (this._mask)
        {
            renderer.maskManager.popMask(this, this._mask);
        }

        if (this._filters)
        {
            renderer.filterManager.popFilter();

        }
        renderer.currentRenderer.start();
    }
    else
    {

        this._renderWebGL3d(renderer);

        var i, j;
        // simple render children!
        for (i = 0, j = this.children.length; i < j; ++i)
        {
            this.children[i].renderWebGL3d(renderer);
        }
    }
};

core.Container.prototype._renderWebGL3d = function(/*renderer*/)
{

};

core.Sprite.prototype.containsPoint = function( point, renderer)
{
    if(this.worldTransform3d)
    {
        return this.containsPoint3d(point, renderer);
    }
    else
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
    }
};

core.Sprite.prototype.containsPoint3d = function( point, renderer )
{
    //
    var ray = math3d.getRayFromScreen(point, renderer);
    var contactPoint = math3d.get2DContactPoint(ray, this); 

    if(!contactPoint)
    {
        return false;
    }

    var width = this._texture._frame.width;
    var height = this._texture._frame.height;
    var x1 = -width * this.anchor.x;
    var y1;

    if ( contactPoint.x > x1 && contactPoint.x < x1 + width )
    {
        y1 = -height * this.anchor.y;

        if ( contactPoint.y > y1 && contactPoint.y < y1 + height )
        {
            return true;
        }
    }

    return false;
};


core.Sprite.prototype._renderWebGL3d = function(renderer)
{
    renderer.setObjectRenderer(renderer.plugins.sprite3d);
    renderer.plugins.sprite3d.render(this);
};

core.Graphics.prototype._renderWebGL3d = function(renderer)
{

    if (this.glDirty)
    {
        this.dirty = true;
        this.glDirty = false;
    }

    renderer.setObjectRenderer(renderer.plugins.graphics3d);
    renderer.plugins.graphics3d.render(this);
};


core.Text.prototype._renderWebGL3d = function(renderer)
{
    if (this.dirty)
    {
        this.updateText();
    }

    renderer.setObjectRenderer(renderer.plugins.sprite3d);
    renderer.plugins.sprite3d.render(this);
};


core.RenderTarget.prototype.projectionMatrix3d = glMat.mat4.create();

core.RenderTarget.prototype.calculateProjection = function (projectionFrame)
{
    var pm = this.projectionMatrix;

    pm.identity();

    if (!this.root)
    {
        pm.a = 1 / projectionFrame.width*2;
        pm.d = 1 / projectionFrame.height*2;

        pm.tx = -1 - projectionFrame.x * pm.a;
        pm.ty = -1 - projectionFrame.y * pm.d;
    }
    else
    {
        pm.a = 1 / projectionFrame.width*2;
        pm.d = -1 / projectionFrame.height*2;

        pm.tx = -1 - projectionFrame.x * pm.a;
        pm.ty = 1 - projectionFrame.y * pm.d;
    }


    var perspectiveMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 1,
        0, 0, 0, 1
    ]

    projection3d = this.projectionMatrix3d;
    glMat.mat4.identity( projection3d );

    projection3d[0] = pm.a;
    projection3d[5] = pm.d;
    projection3d[10] = 2 / 1700;

    // tx // ty
    projection3d[12] = pm.tx;
    projection3d[13] = pm.ty;

    // time to make a 3d one!
    glMat.mat4.multiply(this.projectionMatrix3d, perspectiveMatrix, projection3d);

};


