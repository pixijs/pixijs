/**
 * @author Mat Groves http://matgroves.com/
 */


PIXI.Rope = function(texture, points)
{
	PIXI.Strip.call( this, texture );
	this.points = points;
	
	try
	{
		this.verticies = new Float32Array( points.length * 4);
		this.uvs = new Float32Array( points.length * 4);
		this.colors = new Float32Array(  points.length * 2);
		this.indices = new Uint16Array( points.length * 2);
	}
	catch(error)
	{
		this.verticies = verticies
		
		this.uvs = uvs
		this.colors = colors
		this.indices = indices
	}
	
	this.refresh();
}


// constructor
PIXI.Rope.constructor = PIXI.Rope;
PIXI.Rope.prototype = Object.create( PIXI.Strip.prototype );

PIXI.Rope.prototype.refresh = function()
{
	var points = this.points;
	if(points.length < 1)return;
	
	var uvs = this.uvs
	var indices = this.indices;
	var colors = this.colors;
	
	var lastPoint = points[0];
	var nextPoint;
	var perp = {x:0, y:0};
	var point = points[0];
	
	this.count-=0.2;
	
	
	uvs[0] = 0
	uvs[1] = 1
	uvs[2] = 0
	uvs[3] = 1
	
	colors[0] = 1;
	colors[1] = 1;
	
	indices[0] = 0;
	indices[1] = 1;
	
	var total = points.length;
		
	for (var i =  1; i < total; i++) 
	{
		
		var point = points[i];
		var index = i * 4;
		// time to do some smart drawing!
		var amount = i/(total-1)
		
		if(i%2)
		{
			uvs[index] = amount;
			uvs[index+1] = 0;
			
			uvs[index+2] = amount
			uvs[index+3] = 1
		
		}
		else
		{
			uvs[index] = amount
			uvs[index+1] = 0
			
			uvs[index+2] = amount
			uvs[index+3] = 1
		}
		
		index = i * 2;
		colors[index] = 1;
		colors[index+1] = 1;
		
		index = i * 2;
		indices[index] = index;
		indices[index + 1] = index + 1;
		
		lastPoint = point;
	}
}

PIXI.Rope.prototype.updateTransform = function()
{
	
	var points = this.points;
	if(points.length < 1)return;
	
	var verticies = this.verticies 
	
	var lastPoint = points[0];
	var nextPoint;
	var perp = {x:0, y:0};
	var point = points[0];
	
	this.count-=0.2;
	
	verticies[0] = point.x + perp.x 
	verticies[1] = point.y + perp.y //+ 200
	verticies[2] = point.x - perp.x 
	verticies[3] = point.y - perp.y//+200
	// time to do some smart drawing!
	
	var total = points.length;
		
	for (var i =  1; i < total; i++) 
	{
		
		var point = points[i];
		var index = i * 4;
		
		if(i < points.length-1)
		{
			nextPoint = points[i+1];
		}
		else
		{
			nextPoint = point
		}
		
		perp.y = -(nextPoint.x - lastPoint.x);
		perp.x = nextPoint.y - lastPoint.y;
		
		var ratio = (1 - (i / (total-1))) * 10;
				if(ratio > 1)ratio = 1;
				
		var perpLength = Math.sqrt(perp.x * perp.x + perp.y * perp.y);
		var num = this.texture.height/2//(20 + Math.abs(Math.sin((i + this.count) * 0.3) * 50) )* ratio;
		perp.x /= perpLength;
		perp.y /= perpLength;
	
		perp.x *= num;
		perp.y *= num;
		
		verticies[index] = point.x + perp.x 
		verticies[index+1] = point.y + perp.y
		verticies[index+2] = point.x - perp.x 
		verticies[index+3] = point.y - perp.y

		lastPoint = point;
	}
	
	PIXI.DisplayObjectContainer.prototype.updateTransform.call( this );
}

PIXI.Rope.prototype.setTexture = function(texture)
{
	// stop current texture 
	this.texture = texture;
	this.updateFrame = true;
}




