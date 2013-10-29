/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


PIXI.FilterManager = function()
{
	this.filterStack = [];
	this.texturePool = [];
	
	this.offsetX = 0;
	this.offsetY = 0;
	
	this.initShaderBuffers();
}

// API

PIXI.FilterManager.prototype.begin = function(projection, buffer)
{
	this.width = projection.x * 2;
	this.height = -projection.y * 2;
	this.buffer = buffer;
}

PIXI.FilterManager.prototype.pushFilter = function(filterBlock)
{

	// filter program
	var filter = filterBlock.data[0];
	
	this.offsetX += filterBlock.target.filterArea.x;
	this.offsetY += filterBlock.target.filterArea.y;
	
	this.filterStack.push(filterBlock);
	
	var gl = PIXI.gl;
	
	var texture = this.texturePool.pop();
	if(!texture)texture = new PIXI.FilterTexture();
	
	gl.bindTexture(gl.TEXTURE_2D,  texture.texture);
	
	this.getBounds(filterBlock.target);
	
	var filterArea = filterBlock.target.filterArea;
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  filterArea.width, filterArea.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, texture.frameBuffer);
   
	// set view port
	gl.viewport(0, 0, filterArea.width, filterArea.height);	
	
	//PIXI.currentArea = filterArea

	PIXI.projection.x = filterArea.width/2;
	PIXI.projection.y = -filterArea.height/2;
	
	PIXI.offset.x = -filterArea.x; 
	PIXI.offset.y = -filterArea.y;

	// update projection
	gl.uniform2f(PIXI.currentShader.projectionVector, filterArea.width/2, -filterArea.height/2);
	gl.uniform2f(PIXI.currentShader.offsetVector, -filterArea.x, -filterArea.y);
	//PIXI.primitiveProgram

	gl.colorMask(true, true, true, true); 
	gl.clearColor(0,0,0, 0);     
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	//filter.texture = texture;
	filterBlock._glFilterTexture = texture;
}

PIXI.FilterManager.prototype.popFilter = function()
{
	var filterBlock = this.filterStack.pop();
	var filter = filterBlock.data[0];
	
	//console.log( this.offsetY);
	this.offsetX -= filterBlock.target.filterArea.x;
	this.offsetY -= filterBlock.target.filterArea.y;

	var gl = PIXI.gl;
	
	var sizeX = this.width;
	var sizeY = this.height;
	
	var offsetX = 0;
	var offsetY = 0;
	
	var buffer = this.buffer;
	
	// time to render the filters texture to the previous scene
	if(this.filterStack.length === 0)
	{
		gl.colorMask(true, true, true, false); 
	}
	else
	{
		var currentFilter = this.filterStack[this.filterStack.length-1];
		var filterArea = currentFilter.target.filterArea;
		
		sizeX = filterArea.width;
		sizeY = filterArea.height;
		
		offsetX = filterArea.x;
		offsetY = filterArea.y;
		
		buffer =  currentFilter._glFilterTexture.frameBuffer;
	}
	
	gl.viewport(0, 0, sizeX, sizeY);	
	gl.bindFramebuffer(gl.FRAMEBUFFER, buffer );
	
	///////
	if(!filter.shader)
	{
		//filter.shader = new PIXI.Filter();
		
		var shader = new PIXI.PixiShader();
				
		shader.fragmentSrc = filter.fragmentSrc;
		shader.uniforms = filter.uniforms;
		shader.init();
		
		filter.shader = shader
		//filter.shader.target = filter.target;
	}
	
	var shader = filter.shader;
	var filterArea =  filterBlock.target.filterArea;
	
	// set the shader
	gl.useProgram(shader.program);
	// set the uniforms..

	PIXI.projection.x = sizeX/2;
	PIXI.projection.y = -sizeY/2;

	gl.uniform2f(shader.projectionVector, sizeX/2, -sizeY/2);
	gl.uniform2f(shader.offsetVector, 0,0)

	shader.syncUniforms();

	PIXI.offset.x = offsetX;
	PIXI.offset.y = offsetY; 
	
	var x = filterArea.x-offsetX;
	var y = filterArea.y-offsetY;
	
	// bind the buffers..	
	// make sure to flip the y!
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	
	this.vertexArray[0] = x;
	this.vertexArray[1] = y + filterArea.height;
	
	this.vertexArray[2] = x + filterArea.width;
	this.vertexArray[3] = y + filterArea.height;
	
	this.vertexArray[4] = x;
	this.vertexArray[5] = y;
	
	this.vertexArray[6] = x + filterArea.width;
	this.vertexArray[7] = y;

	gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray);
	
	
    gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

   	gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
	// set texture
    gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, filterBlock._glFilterTexture.texture);
	
	// draw the filter...
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );
	
	// now restore the regular shader..
    gl.useProgram(PIXI.defaultShader.program);
	gl.uniform2f(PIXI.currentShader.projectionVector, sizeX/2, -sizeY/2);
	gl.uniform2f(PIXI.currentShader.offsetVector, -offsetX, -offsetY);

	// return the texture to the pool
	
	this.texturePool.push(filterBlock._glFilterTexture);
	filterBlock._glFilterTexture = null;
	
}

PIXI.FilterManager.prototype.initShaderBuffers = function()
{
	var gl = PIXI.gl;
	
	// create some buffers
	this.vertexBuffer = gl.createBuffer();	
	this.uvBuffer = gl.createBuffer();
	this.indexBuffer = gl.createBuffer();
	
	// bind and upload the vertexs..
	// keep a refferance to the vertexFloatData..
	this.vertexArray = new Float32Array([0.0, 0.0, 
								         1.0, 0.0, 
								         0.0, 1.0, 
								         1.0, 1.0]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.bufferData(
    gl.ARRAY_BUFFER, 
    this.vertexArray, 
    gl.STATIC_DRAW);
    
    
    // bind and upload the uv buffer
	this.uvArray = new Float32Array([0.0, 0.0, 
								     1.0, 0.0, 
								     0.0, 1.0, 
								     1.0, 1.0]);
								         
	gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
	gl.bufferData(
    gl.ARRAY_BUFFER, 
    this.uvArray, 
    gl.STATIC_DRAW);
    
	// bind and upload the index
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER, 
    new Uint16Array([0, 1, 2, 1, 3, 2]), 
    gl.STATIC_DRAW);
}

PIXI.FilterManager.prototype.getBounds = function(displayObject)
{
	// time to get the width and height of the object!
	var worldTransform, width, height, aX, aY, w0, w1, h0, h1, index, doTest;
	var a, b, c, d, tx, ty, x1, x2, x3, x4, y1, y2, y3, y4;

	var tempObject = displayObject.first;
	var testObject = displayObject.last._iNext;
	
	var maxX = -Infinity;
	var maxY = -Infinity;
	
	var minX = Infinity;
	var minY = Infinity;
	
	do	
	{
		// TODO can be optimized! - what if there is no scale / rotation?
		
		if(tempObject instanceof PIXI.Sprite)
		{
			width = tempObject.texture.frame.width;
			height = tempObject.texture.frame.height;

			// TODO trim??
			aX = tempObject.anchor.x;
			aY = tempObject.anchor.y;
			w0 = width * (1-aX);
			w1 = width * -aX;

			h0 = height * (1-aY);
			h1 = height * -aY;

			doTest = true;
		}
		else if(tempObject instanceof PIXI.Graphics)
		{
			tempObject.updateFilterBounds();

			var bounds = tempObject.bounds;

			width = bounds.width;
			height = bounds.height;

			w0 = bounds.x
			w1 = bounds.x + bounds.width;

			h0 = bounds.y
			h1 = bounds.y + bounds.height;

			doTest = true;	
		}
		
		if(doTest)
		{
			worldTransform = tempObject.worldTransform;

			a = worldTransform[0];
			b = worldTransform[3];
			c = worldTransform[1];
			d = worldTransform[4];
			tx = worldTransform[2];
			ty = worldTransform[5];

			x1 = a * w1 + c * h1 + tx; 
			y1 = d * h1 + b * w1 + ty;

			x2 = a * w0 + c * h1 + tx; 
			y2 = d * h1 + b * w0 + ty; 

			x3 = a * w0 + c * h0 + tx; 
			y3 = d * h0 + b * w0 + ty; 

			x4 =  a * w1 + c * h0 + tx; 
			y4 =  d * h0 + b * w1 + ty; 

			minX = x1 < minX ? x1 : minX;
			minX = x2 < minX ? x2 : minX;
			minX = x3 < minX ? x3 : minX;
			minX = x4 < minX ? x4 : minX;
			
			minY = y1 < minY ? y1 : minY;
			minY = y2 < minY ? y2 : minY;
			minY = y3 < minY ? y3 : minY;
			minY = y4 < minY ? y4 : minY;
			
			maxX = x1 > maxX ? x1 : maxX;
			maxX = x2 > maxX ? x2 : maxX;
			maxX = x3 > maxX ? x3 : maxX;
			maxX = x4 > maxX ? x4 : maxX;
			
			maxY = y1 > maxY ? y1 : maxY;
			maxY = y2 > maxY ? y2 : maxY;
			maxY = y3 > maxY ? y3 : maxY;
			maxY = y4 > maxY ? y4 : maxY;
		}

		doTest = false;
		tempObject = tempObject._iNext;
	}
	while(tempObject != testObject)
	
	displayObject.filterArea.x = minX;
	displayObject.filterArea.y = minY;
	displayObject.filterArea.width = maxX - minX;
	displayObject.filterArea.height = maxY - minY;
}

PIXI.FilterTexture = function()
{
	var gl = PIXI.gl;
	
    // next time to create a frame buffer and texture
	this.frameBuffer = gl.createFramebuffer();
    this.texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D,  this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer );
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer );
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
}
