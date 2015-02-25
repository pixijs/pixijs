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
    Sprite3dRenderer    :require('./webgl/Sprite3dRenderer')
};

var core            = require('../core'),
    glMat           = require('gl-matrix'),
    temp3dTransform = glMat.mat4.create(),
    tempVec3        = glMat.vec3.create(),
    tempQuat        = glMat.quat.create();

core.Container.prototype.worldTransform3d = null;

core.Container.prototype.displayObjectUpdateTransform3d = function()
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

    glMat.mat4.scale( this.worldTransform3d, this.worldTransform3d, temp3dTransform)

    if(this.parent.is3d)
    {
        glMat.mat4.multiply(this.worldTransform3d, this.parent.worldTransform3d, this.worldTransform3d);
    }
    else
    {
        //temp
        var temp = glMat.mat4.identity( temp3dTransform );
        var wtp = this.parent.worldTransform;

        temp[0] = wtp.a;
        temp[1] = wtp.b;

        temp[4] = wtp.c;
        temp[5] = wtp.d;

        temp[12] = wtp.tx;
        temp[13] = wtp.ty;

        glMat.mat4.multiply(this.worldTransform3d, temp, this.worldTransform3d);
    }
}

core.Container.prototype.updateTransform3d = function()
{
    if(!this.worldTransform3d)
    {
        this.worldTransform3d = glMat.mat4.create();
    }

    // sooo //
    this.displayObjectUpdateTransform();

    var temp = glMat.mat4.identity( temp3dTransform );
    var wt = this.worldTransform;
    var wt3d = glMat.mat4.identity( this.worldTransform3d );

    wt3d[0] = wt.a;
    wt3d[1] = wt.b;

    wt3d[4] = wt.c;
    wt3d[5] = wt.d;

    wt3d[12] = wt.tx;
    //wt3d[13] = w;

    glMat.mat4.multiply(wt3d, this.parent.worldTransform3d, wt3d);

    for (i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform3d(renderer, i);
    }
}


core.Container.prototype.renderWebGL3d = function (renderer)
{
    // if the object is not visible or the alpha is 0 then no need to render this element
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
    {
        return;
    }

    // no support for filters...
    var i, j;

    this._renderWebGL3d(renderer);

    // simple render children!
    for (i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].renderWebGL3d(renderer);
    }
};

core.Container.prototype._renderWebGL3d = function(renderer)
{
}

core.Sprite.prototype._renderWebGL3d = function(renderer)
{
    renderer.setObjectRenderer(renderer.plugins.sprite3d);
    renderer.plugins.sprite3d.render(this);
}

