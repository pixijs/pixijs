var core = require('../core'),
    glMat = require('gl-matrix'),
    math3d = require('./math'),
    temp3dTransform = glMat.mat4.create(),
    tempVec3 = glMat.vec3.create(),
    tempQuat = glMat.quat.create();


/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * var sprite = new Sprite.fromImage('assets/image.png');
 * ```
 *
 * @class Sprite
 * @extends Container
 * @namespace PIXI
 * @param texture {Texture} The texture for this sprite
 */
function Container3d()
{
    core.Container.call(this);

    // pixin some new 3d magic!
    this.position = new math3d.Point3d(0, 0, 0);
    this.scale = new math3d.Point3d(1, 1, 1);
    this.rotation = new math3d.Point3d(0, 0, 0);

    this.worldTransform3d = glMat.mat4.create();
}


// constructor
Container3d.prototype = Object.create(core.Container.prototype);
Container3d.prototype.constructor = Container3d;

Container3d.prototype.updateTransform = function(texture)
{
    var quat = tempQuat;

    var rx = this.rotation.x;
    var ry = this.rotation.y;
    var rz = this.rotation.z;

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

    if(this.parent.worldTransform3d)
    {
        glMat.mat4.multiply(this.worldTransform3d, this.parent.worldTransform3d, this.worldTransform3d);
    }
    else
    {

        //temp
        var temp = glMat.mat4.identity( temp3dTransform );
        var wtp = this.parent.worldTransform;

        tempVec3[0] = wtp.tx;
        tempVec3[1] = wtp.ty;
        tempVec3[2] = 0;

        glMat.mat4.translate(temp, temp, tempVec3);
        glMat.mat4.multiply(this.worldTransform3d, temp, this.worldTransform3d);
    }

    for (var i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform();
    }
}

module.exports = Container3d;
