/**
 * @namespace PIXI.math
 */

var glMat = require('gl-matrix'),
	Point3d = require('./Point3d'),
	vec3 = glMat.vec3,
	vec4 = glMat.mat4,
	tempPoint = new Point3d();

module.exports = {
    Point3d:      Point3d,


   	intersectPlane:function(n, p0, l0, l, t)
	{
	    // assuming vectors are all normalized
	    var denom = vec3.dot(n, l);

	    if (denom > 1e-6) {

	        var p0l0 = vec3.sub(vec3.create(), p0, l0);

	       // Vec3 p0l0 = p0 - l0;
	        t = vec3.dot(p0l0, n);
	        t /= denom; 

	        
	        return t;//(t >= 0) ? t : null;
	    }
	    return null;
	},

	getRayFromScreen:function(point, renderer)
	{
	    var tempP = vec3.create();

	//   console.log(renderer.width)
	    // get the near plane..
	    tempP[0] = (point.x / (renderer.width * 0.5)) - 1;
	    tempP[1] = 1 - (point.y / (renderer.height * 0.5));
	    tempP[2] = 0;

	    var combinedMatrix = renderer.plugins.sprite3d.combinedMatrix
	   if(!combinedMatrix)return [[0,0,0], [0,0,0]]
	    
	    var inverse = mat4.invert(mat4.create(), combinedMatrix);
	    var origin = vec3.transformMat4(vec3.create(), tempP, inverse);

	    // get the far plane
	    tempP[2] = 0.99;

	    var tempP = vec3.transformMat4(vec3.create(), tempP, inverse);

	    // now calculate the origin..
	    var direction = vec3.subtract(vec3.create(), tempP, origin);
	    direction = vec3.normalize(vec3.create(), direction);

	    // return a ray..
	    return [origin, direction];
	},

	get2DContactPoint:function(ray, container)
	{
	    var transposeInverse = mat3.normalFromMat4(mat3.create(), container.worldTransform3d);

//	    console.log(container.worldTransform3d)
	    var normal = [
	        transposeInverse[6],
	        transposeInverse[7],
	        transposeInverse[8]
	    ]

	    var position = [
	        container.worldTransform3d[12],
	        container.worldTransform3d[13],
	        container.worldTransform3d[14],
	    ]
	   
	    var t = intersectPlane(normal, position, ray[0], ray[1], 1000000);
	    
	    if(t)
	    {
	        // get the contact point..
	        var n = vec3.scale(vec3.create(), ray[1], t);
	        var contact = vec3.add(vec3.create(), ray[0], n);
	     
	        // convet to 2D space..
	        var inverse = mat4.invert( mat4.create(), container.worldTransform3d );

	        var cord2D = vec3.transformMat4(vec3.create(), contact, inverse);

	        return new PIXI.Point(cord2D[0], cord2D[1]);
	    }
	    else
	    {
	        return null
	    }
	}

};
