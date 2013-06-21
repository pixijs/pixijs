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

PIXI.WebGLGraphics.renderGraphics = function(graphics, projection)
{
	PIXI.activatePrimitiveShader();
	var gl = PIXI.gl;
	
	// graphicsObject
	// a collection of "shapes" (mainly lines right now!)
	if(!graphics._webGL)graphics._webGL = {points:[], indices:[], lastPosition:new PIXI.Point(), lastIndex:0, 
										   buffer:gl.createBuffer(),
										   indexBuffer:gl.createBuffer()};
	
	if(graphics.dirty)
	{
		graphics.dirty = false;
		
		if(graphics.clearDirty)
		{
			graphics.clearDirty = false;
			
			graphics._webGL.lastIndex = 0;
			graphics._webGL.points = [];
		}
		
		PIXI.WebGLGraphics.updateGraphics(graphics);
	}
	
	// This  could be speeded up fo sure!
	
	var m = PIXI.mat3.clone(graphics.worldTransform);
	
	PIXI.mat3.transpose(m);
	
	// set the matrix transform for the 
 	gl.uniformMatrix3fv(PIXI.primitiveProgram.translationMatrix, false, m);
	gl.uniform2f(PIXI.primitiveProgram.projectionVector, projection.x, projection.y);

	gl.bindBuffer(gl.ARRAY_BUFFER, graphics._webGL.buffer);
	gl.vertexAttribPointer(PIXI.primitiveProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 4 * 6, 0);
	gl.vertexAttribPointer(PIXI.primitiveProgram.colorAttribute, 4, gl.FLOAT, false,4 * 6, 2 * 4);
	
	// set the index buffer!
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, graphics._webGL.indexBuffer);
	
	//gl.drawArrays(gl.TRIANGLE_STRIP, 0, graphics._webGL.glPoints.length/6);
	
	gl.drawElements(gl.TRIANGLE_STRIP,  graphics._webGL.indices.length, gl.UNSIGNED_SHORT, 0 );
	// return to default shader...
	PIXI.activateDefaultShader();
}

PIXI.WebGLGraphics.updateGraphics = function(graphics)
{
	for (var i=graphics._webGL.lastIndex; i < graphics.graphicsData.length; i++) 
	{
		var data = graphics.graphicsData[i];
		
		
		if(data.type == PIXI.Graphics.POLY)
		{
			if(data.fill)
			{
				if(data.points.length>3) 
				PIXI.WebGLGraphics.buildPoly(data, graphics._webGL);
			}
			
			if(data.lineWidth > 0)
			{
				PIXI.WebGLGraphics.buildLine(data, graphics._webGL);
			}
			
		}
		else if(data.type == PIXI.Graphics.RECT)
		{
			PIXI.WebGLGraphics.buildRectangle(data, graphics._webGL);
		}
		else if(data.type == PIXI.Graphics.CIRC || data.type == PIXI.Graphics.ELIP)
		{
			PIXI.WebGLGraphics.buildCircle(data, graphics._webGL);
		}
	};
	
	//console.log(graphics._webGL.lastIndex - graphics.graphicsData.length )
	graphics._webGL.lastIndex = graphics.graphicsData.length;
	
	// convert to points
	var gl = PIXI.gl;

	graphics._webGL.glPoints = new Float32Array(graphics._webGL.points);
	gl.bindBuffer(gl.ARRAY_BUFFER, graphics._webGL.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, graphics._webGL.glPoints, gl.STATIC_DRAW);
	
	graphics._webGL.glIndicies = new Uint16Array(graphics._webGL.indices);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, graphics._webGL.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, graphics._webGL.glIndicies, gl.STATIC_DRAW);
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
	var width = rectData[2];
	var height = rectData[3];
	
	var totalSegs = 40;
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
			
			verts.push(x + Math.sin(seg * i) * width,
					   y + Math.cos(seg * i) * height);
		
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
			graphicsData.points.push(x + Math.sin(seg * i) * width,
									 y + Math.cos(seg * i) * height)
		};
		
		PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);
	}
	
}

PIXI.WebGLGraphics.buildLine = function(graphicsData, webGLData)
{
	// TODO OPTIMISE!
	
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
	var indices = webGLData.indices;
	
	
	var length = points.length / 2;
	
	var indexCount = points.length + 2;

	var indexStart = verts.length/6;
	
	// DRAW the Line
	var width = graphicsData.lineWidth / 2;
	
	// sort color
	var color = HEXtoRGB(graphicsData.lineColor);
	var alpha = graphicsData.lineAlpha;
	var r = color[0] * alpha;
	var g = color[1] * alpha;
	var b = color[2] * alpha;
	
	// i = 0 //
	var point1 = new PIXI.Point( points[0], points[1] );
	var point2 = new PIXI.Point( points[2], points[3] );
	
	var perp = new PIXI.Point(-(point1.y - point2.y), point1.x - point2.x);
	var dist = Math.sqrt(perp.x*perp.x + perp.y*perp.y);
	
	perp.x /= dist;
	perp.y /= dist;
	perp.x *= width;
	perp.y *= width;
	
	// insert dead triangle as we are using a triangle strip
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
		
		var perp = new PIXI.Point(-(point1.y - point2.y), point1.x - point2.x);
		var dist = Math.sqrt(perp.x*perp.x + perp.y*perp.y);
		perp.x /= dist;
		perp.y /= dist;
		perp.x *= width;
		perp.y *= width;

		var perp2 = new PIXI.Point(-(point2.y - point3.y), point2.x - point3.x);
		var dist2 = Math.sqrt(perp2.x*perp2.x + perp2.y*perp2.y);
		perp2.x /= dist2;
		perp2.y /= dist2;
		perp2.x *= width;
		perp2.y *= width;
		
		var A = new PIXI.Point(-perp.x+ point2.x , -perp.y+point2.y);
		var	B = new PIXI.Point(-perp.x+ point1.x, -perp.y+point1.y);
		
		var E = new PIXI.Point(-perp2.x+ point2.x , -perp2.y+point2.y );
		var F = new PIXI.Point(-perp2.x+ point3.x , -perp2.y+point3.y );
		
		var a1 = B.y-A.y;
	    var b1 = A.x-B.x;
	    var c1 = B.x*A.y - A.x*B.y;
	    var a2 = F.y-E.y;
	    var b2 = E.x-F.x;
	    var c2 = F.x*E.y - E.x*F.y;
	 
	    var denom = a1*b2 - a2*b1;
	    
	    if (denom == 0) {
	    	denom+=1;
	    }
	    
	    var p = new PIXI.Point();
	    
	    p.x = (b1*c2 - b2*c1)/denom;
	    p.y = (a2*c1 - a1*c2)/denom;
    
		
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
			
			indexCount++;
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
	
	var perp = new PIXI.Point(-(point1.y - point2.y), point1.x - point2.x);
	//getPerp(point1, point2);
	var dist = Math.sqrt(perp.x*perp.x + perp.y*perp.y);
	perp.x /= dist;
	perp.y /= dist;
	perp.x *= width;
	perp.y *= width;
	
	verts.push(point2.x - perp.x , point2.y - perp.y)
	verts.push(r, g, b, alpha);
//	indices.push(indices.length)
	
	verts.push(point2.x + perp.x , point2.y + perp.y)
	verts.push(r, g, b, alpha);
//	indices.push(indices.length)
	
	for (var i=0; i < indexCount; i++) 
	{
		indices.push(indexStart + i);
	};
	// set last triangle!
	webGLData.lastPosition.x = point2.x + perp.x;
	webGLData.lastPosition.y = point2.y + perp.y;
}


PIXI.WebGLGraphics.buildPoly = function(graphicsData, webGLData)
{
	var points = graphicsData.points;
	if(points.length < 6)return;
	
	// get first and last point.. figure out the middle!
	
	var verts = webGLData.points;
	var indices = webGLData.indices;
	
	var length = points.length / 2;
	
	// sort color
	var color = HEXtoRGB(graphicsData.fillColor);
	var alpha = graphicsData.lineAlpha;
	var r = color[0] * alpha;
	var g = color[1] * alpha;
	var b = color[2] * alpha;
	
	
	
	
	var triangles = PolyK.Triangulate(graphicsData.points);
	
	// DEAD Triangle
	verts.push(points[i * 2], points[i * 2 + 1],
				   r, g, b, alpha);
	indices.push(verts.length/6)
	indices.push(verts.length/6)
	
	var vertPos = verts.length / 6;
	for (var i=0; i < triangles.length; i+=3) 
	{
		indices.push(triangles[i] + vertPos);
		indices.push(triangles[i] + vertPos);
		indices.push(triangles[i+1] + vertPos);
		indices.push(triangles[i+2] +vertPos);
		indices.push(triangles[i+2] + vertPos);
	};
	
	for (var i = 0; i < length; i++) 
	{
		verts.push(points[i * 2], points[i * 2 + 1],
				   r, g, b, alpha);
	};
	
}

function HEXtoRGB(hex) {
	return [(hex >> 16 & 0xFF) / 255, ( hex >> 8 & 0xFF) / 255, (hex & 0xFF)/ 255];
}




