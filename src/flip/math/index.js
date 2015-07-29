/**
 * @namespace PIXI.math
 */

var glMat = require('gl-matrix'),
	Point3d = require('./Point3d'),
	vec3 = glMat.vec3,
	mat4 = glMat.mat4,
	mat3 = glMat.mat3,
	mat3 = glMat.mat3,
	core = require('../../core')

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

	    //TODO MAKE THIS NOT THIS!
	     var combinedMatrix = window.combinedMatrix;//mat4.multiply(mat4.create(), perspectiveMatrix, projection3d);
	     if(!combinedMatrix)return [[0,0,0], [0,0,0]];
	     var inverse = mat4.invert(mat4.create(), combinedMatrix);

	  	
	    // get the near plane..
	    tempP[0] = (point.x / (renderer.width * 0.5)) - 1;
	    tempP[1] = 1 - (point.y / (renderer.height * 0.5));
	    tempP[2] = 0;

	    var origin = vec3.transformMat4(vec3.create(), tempP, inverse);

	    // get the far plane
	    tempP[2] = 0.99;

	    tempP = this.projectionTransformMat4(vec3.create(), tempP, inverse);

	    // now calculate the origin..
	    var direction = vec3.subtract(vec3.create(), tempP, origin);
	    direction = vec3.normalize(vec3.create(), direction);

	    // return a ray..
	    return [origin, direction];
	},

	projectionTransformMat4:function(out, a, m) 
	{
	    var x = a[0], y = a[1], z = a[2],
	        w = m[3] * x + m[7] * y + m[11] * z + m[15];
	    w = w || 1.0;
	    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
	    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
	    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
	    return out;
	},

	get2DContactPoint:function(ray, container)
	{
	    var transposeInverse = mat3.normalFromMat4(mat3.create(), container.worldTransform3d);

	    if(!transposeInverse)return;
	    
	    var normal = [
	        transposeInverse[6],
	        transposeInverse[7],
	        transposeInverse[8]
	    ]
	    	
	    if(normal[2] < 0)
	    {
	    	normal[2] *= -1
	    }

	    var position = [
	        container.worldTransform3d[12],
	        container.worldTransform3d[13],
	        container.worldTransform3d[14],
	    ]
	   
	    var t = this.intersectPlane(normal, position, ray[0], ray[1], 1000000);
	    
	    if(t)
	    {
	        // get the contact point..
	        var n = vec3.scale(vec3.create(), ray[1], t);
	        var contact = vec3.add(vec3.create(), ray[0], n);
	     
	        // convet to 2D space..
	        var inverse = mat4.invert( mat4.create(), container.worldTransform3d );

	        var cord2D = vec3.transformMat4(vec3.create(), contact, inverse);

	        return new core.Point(cord2D[0], cord2D[1]);
	    }
	    else
	    {
	        return null
	    }
	}

};
