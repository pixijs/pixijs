/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * A DisplayObjectContainer represents a collection of display objects. It is the base class of all display objects that act as a container for other objects.
 * @class DisplayObjectContainer 
 * @extends DisplayObject
 * @constructor
 */
PIXI.Graphics = function()
{
	PIXI.DisplayObjectContainer.call( this );
	
	this.renderable = true;
	
	// style - color
	// style - thickness
	// alpha - 
	
	this.paths = [];	
	this.currentPath = {points:[]};
	
	// path has a 
	// line?
	// fill?
	// 
	
	this.colors = new Float32Array([100]);
		
//		this.indices = new Uint16Array([0, 1, 2, 3]);
}

// constructor
PIXI.Graphics.constructor = PIXI.Graphics;
PIXI.Graphics.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

PIXI.Graphics.prototype.lineStyle = function(thickness, color)
{
	
}


PIXI.Graphics.prototype.moveTo = function(x, y)
{
	this.currentPath.points.push(x, y);
}

PIXI.Graphics.prototype.lineTo = function(x, y)
{
	this.currentPath.points.push(x, y);
}

PIXI.Graphics.prototype.render = function(renderer)
{
	
	var context = renderer.context;
	var points = this.currentPath.points;
	var length = this.currentPath.points.length / 2;
	
	context.lineWidth = 40;
	context.globalAlpha = 1;
	
	context.strokeStyle="#FF0000";
	
	context.beginPath();
	
	
	context.moveTo( points[0], points[1] )
	
	for (var i=1; i < length; i++) {
	  	context.lineTo( points[i * 2], points[i * 2 + 1] );
	};
	
	context.stroke();
	
}
/*
PIXI.Graphics.prototype.render = function()
{
	var context = renderer.context;
	var points = this.currentPath.points;
	var length = this.currentPath.points.length / 2;
	
	context.lineWidth = 5;
	context.globalAlpha = 1;
	
	context.strokeStyle="#FF0000";
	
//	graphics.clear();
//	graphics.lineStyle(3, 0xFF0000);
	context.beginPath();
	
	// DRAW the Line
	context.moveTo(points[0], points[1]);
	
	for (var i = 1; i < length; i++) 
	{
		var linex = points[i* 2];
		var liney = points[i*2 + 1];
		context.lineTo(linex, liney);	
		
	}
	
	context.stroke()
	context.lineWidth = 2;
	
	context.beginPath();
	
	var newVerts = PIXI.Shape.convertPoints(points);
	
	for (var i = 1; i < newVerts.length/2; i++) 
	{
		var linex = newVerts[i* 2];
		var liney = newVerts[i*2 + 1];
		context.lineTo(linex, liney);	
		
	}	
	
	context.stroke();
	
	return;
}
*/



PIXI.Graphics.prototype.renderWebGL = function(renderer)
{
	if(!this.shape)
	{
		this.shape = new PIXI.Shape(this.currentPath.points);
	}
	
	this.shape.draw();
	
	/*
	var context = renderer.context;
	var points = this.currentPath.points;
	var length = this.currentPath.points.length / 2;
	
	context.globalAlpha = 1;
	
	context.strokeStyle="#FF0000";
	
	context.beginPath();
	
	context.moveTo( points[0], points[1] )
	
	for (var i=1; i < length; i++) {
	  	context.lineTo( points[i * 2], points[i * 2 + 1] );
	};
	
	context.stroke();
	*/
	
	//console.log("@@")
	
	// ----- lines ------ //
}

PIXI.Shape = function(points)
{
	this.points = new Float32Array(points);
	
	var gl = PIXI.gl;
	
	this.buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);
	
	this.initShaders();
	
}

PIXI.primitiveShaderFragmentSrc = [
  "precision mediump float;",
  //"uniform vec4 color;",
  "void main(void) {",
    "gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);",
  "}"
];

PIXI.primitiveShaderVertexSrc = [
  "attribute vec2 aVertexPosition;",
  "uniform mat4 uMVMatrix;",
  "void main(void) {",
    "gl_Position = uMVMatrix * vec4(aVertexPosition, 1.0, 1.0);",
  "}"
];

PIXI.Shape.prototype.initShaders = function() 
{
	var gl = PIXI.gl;
	var fragmentShader = PIXI.CompileFragmentShader(gl, PIXI.primitiveShaderFragmentSrc);
	var vertexShader = PIXI.CompileVertexShader(gl, PIXI.primitiveShaderVertexSrc);
	
	PIXI.shaderProgram2 = gl.createProgram();
	
	var shaderProgram = PIXI.shaderProgram2;
	
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	//    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
 	//   gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	
	///shaderProgram.colorAttribute = gl.getAttribLocation(shaderProgram, "color");
    //gl.enableVertexAttribArray(shaderProgram.colorAttribute);

	//shaderProgram.color = gl.getUniformLocation(shaderProgram, "color");
	//console.log(shaderProgram.color)
	//gl.uniform4f(shaderProgram.color, 1.0, 0.0, 0.0, 1.0);
	
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}
 
PIXI.Shape.constructor = PIXI.Shape;


PIXI.Shape.prototype.draw = function()
{
	var gl = PIXI.gl;
	gl.useProgram(PIXI.shaderProgram2);
	gl.lineWidth(5);
	
	var webGLPoints = PIXI.Shape.convertPoints(this.points);
	
	
	
//	console.log(PIXI.shaderProgram2.mvMatrixUniform)
	gl.uniformMatrix4fv(PIXI.shaderProgram2.mvMatrixUniform, false, PIXI.projectionMatrix );
    gl.vertexAttribPointer(PIXI.shaderProgram2.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
//	gl.bufferSubData(gl.ARRAY_BUFFER, 0, webGLPoints)
	gl.bufferData(gl.ARRAY_BUFFER, webGLPoints, gl.STATIC_DRAW);
	
	
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, webGLPoints.length/2);
	
	gl.useProgram(PIXI.shaderProgram);
}


PIXI.Shape.convertPoints = function(points)
{
	var verts = [];//0, 0, 0, 0];
	
	var length = points.length / 2;
	
	// DRAW the Line
	verts.push(points[0], points[1])
	
	var width = 20;
	
	// i = 0 //
	var point1 = new PIXI.Point( points[0], points[1] );
	var point2 = new PIXI.Point( points[2], points[3] );
	var perp = getPerp(point1, point2);
	var dist = Math.sqrt(perp.x*perp.x + perp.y*perp.y);
	perp.x /= dist;
	perp.y /= dist;
	perp.x *= width;
	perp.y *= width;
	
	verts.push(points[0] - perp.x , points[1] - perp.y)
	verts.push(points[0] + perp.x , points[1] + perp.y)
	for (var i = 1; i < length-1; i++) 
	{
		var point1 = new PIXI.Point( points[(i-1)*2],points[(i-1)*2 + 1] );
		var point2 = new PIXI.Point(points[(i)*2],points[(i)*2 + 1] );
		var point3 = new PIXI.Point(points[(i+1)*2],points[(i+1)*2 + 1] );
		
		

		var perp = getPerp(point1, point2);
		var dist = Math.sqrt(perp.x*perp.x + perp.y*perp.y);
		perp.x /= dist;
		perp.y /= dist;
		perp.x *= width;
		perp.y *= width;

		var perp2 = getPerp(point2, point3);
		var dist2 = Math.sqrt(perp2.x*perp2.x + perp2.y*perp2.y);
		perp2.x /= dist2;
		perp2.y /= dist2;
		perp2.x *= width;
		perp2.y *= width;
		
		
		var p1 = new PIXI.Point(-perp.x+ point2.x , -perp.y+point2.y);
		var p1_ = new PIXI.Point(-perp.x+ point1.x, -perp.y+point1.y);
		
		var p2 = new PIXI.Point(-perp2.x+ point2.x , -perp2.y+point2.y );
		var p2_ = new PIXI.Point(-perp2.x+ point3.x , -perp2.y+point3.y );
		
		var p = lineIntersectLine(p1, p1_, p2, p2_);
		
		var pdist = (p.x -point2.x) * (p.x -point2.x) + (p.y -point2.y) + (p.y -point2.y);
		
		if(pdist > 50 * 50)
		{
			var perp3 = new PIXI.Point(perp.x - perp2.x, perp.y - perp2.y);
			var dist3 = Math.sqrt(perp3.x*perp3.x + perp3.y*perp3.y);
			perp3.x /= dist3;
			perp3.y /= dist3;
			perp3.x *= width;
			perp3.y *= width;
//					var perp = 
			verts.push(point2.x - perp3.x, point2.y -perp3.y);
			verts.push(point2.x + perp3.x, point2.y +perp3.y);
			verts.push(point2.x - perp3.x, point2.y -perp3.y);
		//	graphics.drawCircle(point2.x - (p.x-point2.x), point2.y - (p.y - point2.y), 4);	
				
		}
		else
		{
			
	//	context.fillRect(2,1,1,1);
			verts.push(p.x , p.y);
			verts.push(point2.x - (p.x-point2.x), point2.y - (p.y - point2.y));//, 4);
		}
	}
	
	var point1 = new PIXI.Point( points[(length-2)*2], points[(length-2)*2 + 1] );
	var point2 = new PIXI.Point( points[(length-1)*2], points[(length-1)*2 + 1] );
	
	var perp = getPerp(point1, point2);
	
	var dist = Math.sqrt(perp.x*perp.x + perp.y*perp.y);
	perp.x /= dist;
	perp.y /= dist;
	perp.x *= width;
	perp.y *= width;

	verts.push(point2.x - perp.x , point2.y - perp.y)
	verts.push(point2.x + perp.x , point2.y + perp.y)
	
	return new Float32Array(verts);
}

function normalise(point)
{
	var dist = Math.sqrt(point.x * point.x + point.y * point.y);
	return new PIXI.Point(point.x / dist, point.y / dist);
}

function getPerp(point, point2)
{
	return new PIXI.Point(-(point.y - point2.y), point.x - point2.x);
}

function lineIntersectLine(A,B,E,F) 
{
    var ip;
    var a1;
    var a2;
    var b1;
    var b2;
    var c1;
    var c2;
 
    a1= B.y-A.y;
    b1= A.x-B.x;
    c1= B.x*A.y - A.x*B.y;
    a2= F.y-E.y;
    b2= E.x-F.x;
    c2= F.x*E.y - E.x*F.y;
 
    var denom=a1*b2 - a2*b1;
    
    if (denom == 0) {
    //    return null;
    	denom+=1;
    }
    ip=new PIXI.Point();
    ip.x=(b1*c2 - b2*c1)/denom;
    ip.y=(a2*c1 - a1*c2)/denom;
 
    //---------------------------------------------------
    //Do checks to see if intersection to endpoints
    //distance is longer than actual Segments.
    //Return null if it is with any.
    //---------------------------------------------------
    

    return ip;
}	

/*
PIXI.Shape.prototype.convertPoints = function(points)
{
	var verts = [0, 0, 0, 0];
	
	var total = points.length/2;
//	var lastPoint = points[0];
	var lastPointX = points[0];
	var lastPointY = points[1];
	var nextPointX = 0;
	var nextPointY = 0;
	
	var perp = {x:0, y:0};
	var pointX = points[0];
	var pointY = points[1];
	
	for (var i =  1; i < total; i++) 
	{
		
		var pointX = points[i * 2];
		var pointY = points[i * 2 + 1];
	
		var index = i * 4;
		
		if(i < points.length-2)
		{
			nextPointX = points[(i+1) * 2];
			nextPointY = points[(i+1) * 2 + 1];
		}
		else
		{
			nextPointX = pointX;
			nextPointY = pointY;
		}
		
		perp.y = -(nextPointX - lastPointX);
		perp.x = nextPointY - lastPointY;
		
		var ratio = (1 - (i / (total-1))) * 10;
		if(ratio > 1)ratio = 1;
				
		var perpLength = Math.sqrt(perp.x * perp.x + perp.y * perp.y);
		var num = 10;
		perp.x /= perpLength;
		perp.y /= perpLength;
	
		perp.x *= num;
		perp.y *= num;
		verts[index] = pointX + perp.x 
		verts[index+1] = pointY + perp.y
		verts[index+2] = pointX - perp.x 
		verts[index+3] = pointY - perp.y

		lastPointX = pointX;
		lastPointY = pointY;
	}
	
	return new Float32Array(verts);
}
*/
/**
 * @private
 */
PIXI.Graphics.prototype.updateTransform = function()
{
	if(!this.visible)return;
	
	PIXI.DisplayObject.prototype.updateTransform.call( this );
	
}

