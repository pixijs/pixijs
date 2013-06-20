/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * A DisplayObjectContainer represents a collection of display objects. It is the base class of all display objects that act as a container for other objects.
 * @class DisplayObjectContainer 
 * @extends DisplayObject
 * @constructor
 */
PIXI.WebGLGraphics = function()
{
	
}

// constructor
PIXI.WebGLGraphics.constructor = PIXI.WebGLGraphics;

PIXI.WebGLGraphics.renderGraphics = function(graphics)
{
	PIXI.activatePrimitiveShader();
	var gl = PIXI.gl;
	
	// graphicsObject
	// a collection of "shapes" (mainly lines right now!)
	///this.shape.draw();
	if(!graphics._webGL)graphics._webGL = {points:[], lastPosition:new PIXI.Point(), lastIndex:0, buffer:gl.createBuffer()};
	
	if(graphics.dirty)
	{
		graphics.dirty = false;
		
		if(graphics.clearDirty)
		{
			graphics.clearDirty = false;
			
			graphics._webGL.lastIndex = 0;
			graphics._webGL.points = [];
		}
		
		PIXI.WebGLGraphics.initGraphics(graphics);
	}
	
	gl.uniformMatrix4fv(PIXI.shaderProgram2.mvMatrixUniform, false, PIXI.projectionMatrix );
	
	gl.bindBuffer(gl.ARRAY_BUFFER, graphics._webGL.buffer);
	gl.vertexAttribPointer(PIXI.shaderProgram2.vertexPositionAttribute, 2, gl.FLOAT, false, 4 * 6, 0);
	gl.vertexAttribPointer(PIXI.shaderProgram2.colorAttribute, 4, gl.FLOAT, false,4 * 6, 2 * 4);
	
	//shaderProgram.colorAttribute
	
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, graphics._webGL.glPoints.length/6);
	
	PIXI.activateDefaultShader();
}

PIXI.WebGLGraphics.initGraphics = function(graphics)
{
	for (var i=graphics._webGL.lastIndex; i < graphics.graphicsData.length; i++) 
	{
		var data = graphics.graphicsData[i];
		
		if(data.type == PIXI.Graphics.POLY)
		{
			if(data.lineWidth > 0)
			{
				PIXI.WebGLGraphics.buildLine(data, graphics._webGL);
			}
		}
		else if(data.type == PIXI.Graphics.RECT)
		{
			PIXI.WebGLGraphics.buildRectangle(data, graphics._webGL);
		}
		else if(data.type == PIXI.Graphics.CIRC)
		{
			PIXI.WebGLGraphics.buildCircle(data, graphics._webGL);
		}
	};
	
	//console.log(graphics._webGL.lastIndex - graphics.graphicsData.length )
	graphics._webGL.lastIndex = graphics.graphicsData.length;
	
	// convert to points
	graphics._webGL.glPoints = new Float32Array(graphics._webGL.points);
	
	var gl = PIXI.gl;
	gl.bindBuffer(gl.ARRAY_BUFFER, graphics._webGL.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, graphics._webGL.glPoints, gl.STATIC_DRAW);
}


PIXI.WebGLGraphics.buildRectangle = function(graphicsData, webGLData)
{
	// --- //
	// need to convert points to a nice regular data
	// 
	var rectData = graphicsData.points;
	var x = rectData[0];
	var y = rectData[1];
	var width = rectData[2];
	var height = rectData[3];
	
	
	if(graphicsData.fill)
	{
		var color = HEXtoRGB(graphicsData.fillColor);
		var alpha = graphicsData.fillAlpha;

		var r = color[0] * alpha;
		var g = color[1] * alpha;
		var b = color[2] * alpha;
	
		var verts = webGLData.points;
		
		// dead triangle
		verts.push(webGLData.lastPosition.x, webGLData.lastPosition.y, 1, 1, 1, 1); 
		verts.push(x, y, 1, 1, 1, 1);
		
		// start
		verts.push(x, y);
		verts.push(r, g, b, alpha);
		
		verts.push(x + width, y);
		verts.push(r, g, b, alpha);
		
		verts.push(x , y + height);
		verts.push(r, g, b, alpha);
		
		verts.push(x + width, y + height);
		verts.push(r, g, b, alpha);
		
		webGLData.lastPosition.x = x + width;
		webGLData.lastPosition.y = y + height;
	}
	
	if(graphicsData.lineWidth)
	{
		graphicsData.points = [x, y,
				  x + width, y,
				  x + width, y + height,
				  x, y + height,
				  x, y];
	
		PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);
	}
	
}

PIXI.WebGLGraphics.buildCircle = function(graphicsData, webGLData)
{
	// --- //
	// need to convert points to a nice regular data
	// 
	var rectData = graphicsData.points;
	var x = rectData[0];
	var y = rectData[1];
	var radius = rectData[2];
	
	var totalSegs = 40
	var seg = (Math.PI * 2) / totalSegs ;
		
	if(graphicsData.fill)
	{
		var color = HEXtoRGB(graphicsData.fillColor);
		var alpha = graphicsData.fillAlpha;

		var r = color[0] * alpha;
		var g = color[1] * alpha;
		var b = color[2] * alpha;
	
		var verts = webGLData.points;
		
		verts.push(webGLData.lastPosition.x, webGLData.lastPosition.y, 1, 1, 1, 1); 
		verts.push(x, y, 1, 1, 1, 1);
		
		for (var i=0; i < totalSegs + 1 ; i++) 
		{
			verts.push(x,y);
			verts.push(r, g, b, alpha);
			
			verts.push(x + Math.sin(seg * i) * radius,
					   y + Math.cos(seg * i) * radius);
		
			verts.push(r, g, b, alpha);
		};
		
		verts.push(x,y);
		verts.push(1, 0, 0, 1);
		
		webGLData.lastPosition.x = x;
		webGLData.lastPosition.y = y;
	}
	
	if(graphicsData.lineWidth)
	{
		graphicsData.points = [];
		
		for (var i=0; i < totalSegs + 1; i++) 
		{
			graphicsData.points.push(x + Math.sin(seg * i) * radius,
									 y + Math.cos(seg * i) * radius)
		};
		
		PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);
	}
	
}

PIXI.WebGLGraphics.buildLine = function(graphicsData, webGLData)
{
	var wrap = true;
	var points = graphicsData.points;
	if(points.length == 0)return;
	
	// get first and last point.. figure out the middle!
	var firstPoint = new PIXI.Point( points[0], points[1] );
	var lastPoint = new PIXI.Point( points[points.length - 2], points[points.length - 1] );
	
	// if the first point is the last point - goona have issues :)
	if(firstPoint.x == lastPoint.x && firstPoint.y == lastPoint.y)
	{
		points.pop();
		points.pop();
		
		lastPoint = new PIXI.Point( points[points.length - 2], points[points.length - 1] );
		
		var midPointX = lastPoint.x + (firstPoint.x - lastPoint.x) *0.5;
		var midPointY = lastPoint.y + (firstPoint.y - lastPoint.y) *0.5;
		
		points.unshift(midPointX, midPointY);
		points.push(midPointX, midPointY)
	}
	
	var verts = webGLData.points;
	
	var length = points.length / 2;
	
	// DRAW the Line
	var width = graphicsData.lineWidth / 2;
	
	var color = HEXtoRGB(graphicsData.lineColor);
	var alpha = graphicsData.lineAlpha;
	var r = color[0] * alpha;
	var g = color[1] * alpha;
	var b = color[2] * alpha;
	
	// i = 0 //
	var point1 = new PIXI.Point( points[0], points[1] );
	var point2 = new PIXI.Point( points[2], points[3] );
	var perp = getPerp(point1, point2);
	var dist = Math.sqrt(perp.x*perp.x + perp.y*perp.y);
	
	perp.x /= dist;
	perp.y /= dist;
	perp.x *= width;
	perp.y *= width;
	
	// insert dead triangle!
	verts.push(webGLData.lastPosition.x, webGLData.lastPosition.y, 1, 1, 1, 1); 
	verts.push(points[0] - perp.x , points[1] - perp.y, 1, 1, 1, 1);
	
	
	// start
	verts.push(points[0] - perp.x , points[1] - perp.y);
	verts.push(r, g, b, alpha);
	
	verts.push(points[0] + perp.x , points[1] + perp.y);
	verts.push(r, g, b, alpha);
	
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
		
		if(pdist > 140 * 140)
		{
			var perp3 = new PIXI.Point(perp.x - perp2.x, perp.y - perp2.y);
			var dist3 = Math.sqrt(perp3.x*perp3.x + perp3.y*perp3.y);
			perp3.x /= dist3;
			perp3.y /= dist3;
			perp3.x *= width;
			perp3.y *= width;
			
			verts.push(point2.x - perp3.x, point2.y -perp3.y);
			verts.push(r, g, b, alpha);
	
			verts.push(point2.x + perp3.x, point2.y +perp3.y);
			verts.push(r, g, b, alpha);
	
			verts.push(point2.x - perp3.x, point2.y -perp3.y);
			verts.push(r, g, b, alpha);
		}
		else
		{
			verts.push(p.x , p.y);
			verts.push(r, g, b, alpha);
	
			verts.push(point2.x - (p.x-point2.x), point2.y - (p.y - point2.y));//, 4);
			verts.push(r, g, b, alpha);
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
	verts.push(r, g, b, alpha);
	
	verts.push(point2.x + perp.x , point2.y + perp.y)
	verts.push(r, g, b, alpha);
	
	// set last triangle!
	webGLData.lastPosition.x = point2.x + perp.x;
	webGLData.lastPosition.y = point2.y + perp.y;
	
}

function HEXtoRGB(hex) {
	return [(hex >> 16 & 0xFF) / 255, ( hex >> 8 & 0xFF) / 255, (hex & 0xFF)/ 255];
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
    console.log("!")
    	denom+=1;
    }
    ip=new PIXI.Point();
    ip.x=(b1*c2 - b2*c1)/denom;
    ip.y=(a2*c1 - a1*c2)/denom;

    return ip;
}	



PIXI.primitiveShaderFragmentSrc = [
  "precision mediump float;",
  "varying vec4 vColor;",
  "void main(void) {",
    "gl_FragColor = vColor;",
  "}"
];

PIXI.primitiveShaderVertexSrc = [
  "attribute vec2 aVertexPosition;",
  "attribute vec4 aColor;",
  "uniform mat4 uMVMatrix;",
  "varying vec4 vColor;",
  "void main(void) {",
    "gl_Position = uMVMatrix * vec4(aVertexPosition, 1.0, 1.0);",
    "vColor = aColor;",
  "}"
];


PIXI.WebGLGraphics.initShaders = function() 
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
    shaderProgram.colorAttribute = gl.getAttribLocation(shaderProgram, "aColor");
    
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}
