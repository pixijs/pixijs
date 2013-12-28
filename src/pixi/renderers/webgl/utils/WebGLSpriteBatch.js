/**
 * @author Mat Groves + Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * 
 * Heavily inspired by LibGDX's WebGLSpriteBatch:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/WebGLSpriteBatch.java
 */

PIXI.WebGLSpriteBatch = function(gl)
{
    this.gl = gl;

    // create a couple of buffers
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();


    this.size = 2000;
    // 65535 is max index, so 65535 / 6 = 10922.
       
    //the total number of floats in our batch
    var numVerts = this.size * 4 * 6;
    //the total number of indices in our batch
    var numIndices = this.size * 6;

    //TODO: use properties here
    //current blend mode.. changing it flushes the batch
    this.blendMode = PIXI.blendModes.NORMAL;

    //vertex data
    this.vertices = new Float32Array(numVerts);
    //index data
    this.indices = new Uint16Array(numIndices); 
    
    this.lastIndexCount = 0;

    for (var i=0, j=0; i < numIndices; i += 6, j += 4) 
    {
        this.indices[i + 0] = j + 0; 
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    };

    //upload the index data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

    this.drawing = false;
    this.currentBatchSize = 0;
    this.currentBaseTexture;
}

PIXI.WebGLSpriteBatch.prototype.begin = function(renderSession)
{ 
    this.renderSession = renderSession;

    var gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    var stride = 6 * 4;

    var projection = renderSession.projection;

    gl.uniform2f(PIXI.defaultShader.projectionVector, projection.x, projection.y);

    gl.vertexAttribPointer(PIXI.defaultShader.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(PIXI.defaultShader.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * 4);
    gl.vertexAttribPointer(PIXI.defaultShader.colorAttribute, 2, gl.FLOAT, false, stride, 4 * 4);

    this.currentBlendMode = 99999;
}

PIXI.WebGLSpriteBatch.prototype.end = function()
{ 
    this.flush();
}


PIXI.WebGLSpriteBatch.prototype.render = function(sprite)
{   
    // check texture..
    if(sprite.texture.baseTexture !== this.currentBaseTexture || this.currentBatchSize >= this.size)
    {
        this.flush();
        this.currentBaseTexture = sprite.texture.baseTexture;
    }

    // check blend mode
    if(sprite.blendMode !== this.currentBlendMode)
    {
        this.setBlendMode(sprite.blendMode);
    }

    // get the uvs for the texture
    var uvs = sprite.texture._uvs;
    // if the uvs have not updated then no point rendering just yet!
    if(!uvs)return;

    // get the sprites current alpha
    var alpha = sprite.worldAlpha;
    var tint = sprite.tint;

    var  verticies = this.vertices;

    width = sprite.texture.frame.width;
    height = sprite.texture.frame.height;

    // TODO trim??
    var aX = sprite.anchor.x; // - sprite.texture.trim.x
    var aY = sprite.anchor.y; //- sprite.texture.trim.y
    var w0 = width * (1-aX);
    var w1 = width * -aX;

    var h0 = height * (1-aY);
    var h1 = height * -aY;

    var index = this.currentBatchSize * 4 * 6;

    worldTransform = sprite.worldTransform;

    var a = worldTransform[0];
    var b = worldTransform[3];
    var c = worldTransform[1];
    var d = worldTransform[4];
    var tx = worldTransform[2];
    var ty = worldTransform[5];

    // xy
    verticies[index++] = a * w1 + c * h1 + tx;
    verticies[index++] = d * h1 + b * w1 + ty;
    // uv
    verticies[index++] = uvs[0];
    verticies[index++] = uvs[1];
    // color
    verticies[index++] = alpha;
    verticies[index++] = tint;

    // xy
    verticies[index++] = a * w0 + c * h1 + tx;
    verticies[index++] = d * h1 + b * w0 + ty;
    // uv
    verticies[index++] = uvs[2];
    verticies[index++] = uvs[3];
    // color
    verticies[index++] = alpha;
    verticies[index++] = tint;

    // xy
    verticies[index++] = a * w0 + c * h0 + tx;
    verticies[index++] = d * h0 + b * w0 + ty;
    // uv
    verticies[index++] = uvs[4];
    verticies[index++] = uvs[5];
    // color
    verticies[index++] = alpha;
    verticies[index++] = tint;

    // xy
    verticies[index++] = a * w1 + c * h0 + tx;
    verticies[index++] = d * h0 + b * w1 + ty;
    // uv
    verticies[index++] = uvs[6];
    verticies[index++] = uvs[7];
    // color
    verticies[index++] = alpha;
    verticies[index++] = tint;

    // increment the batchs
    this.currentBatchSize++;


}

PIXI.WebGLSpriteBatch.prototype.renderTilingSprite = function(tilingSprite)
{   
    var texture = tilingSprite.texture;

    if(texture.baseTexture !== this.currentBaseTexture || this.currentBatchSize >= this.size)
    {
        this.flush();
        this.currentBaseTexture = texture.baseTexture;
    }

     // check blend mode
    if(tilingSprite.blendMode !== this.currentBlendMode)
    {
        this.setBlendMode(tilingSprite.blendMode);
    }

     // set the textures uvs temporarily
    // TODO create a seperate texture so that we can tile part of a texture
    var tempUvs = texture._uvs;

    if(!tilingSprite._uvs)tilingSprite._uvs = new Float32Array(8);

    var uvs = tilingSprite._uvs;

    var offsetX =  tilingSprite.tilePosition.x/texture.baseTexture.width;
    var offsetY =  tilingSprite.tilePosition.y/texture.baseTexture.height;

    var scaleX =  (tilingSprite.width / texture.baseTexture.width)  / tilingSprite.tileScale.x;
    var scaleY =  (tilingSprite.height / texture.baseTexture.height) / tilingSprite.tileScale.y;

    uvs[0] = 0 - offsetX;
    uvs[1] = 0 - offsetY;

    uvs[2] = (1 * scaleX) - offsetX;
    uvs[3] = 0 - offsetY;

    uvs[4] = (1 * scaleX) - offsetX;
    uvs[5] = (1 * scaleY) - offsetY;

    uvs[6] = 0 - offsetX;
    uvs[7] = (1 *scaleY) - offsetY;

   
   
    // get the tilingSprites current alpha
    var alpha = tilingSprite.worldAlpha;
    var tint = tilingSprite.tint;

    var  verticies = this.vertices;

    width = tilingSprite.width;
    height = tilingSprite.height;

    // TODO trim??
    var aX = tilingSprite.anchor.x; // - tilingSprite.texture.trim.x
    var aY = tilingSprite.anchor.y; //- tilingSprite.texture.trim.y
    var w0 = width * (1-aX);
    var w1 = width * -aX;

    var h0 = height * (1-aY);
    var h1 = height * -aY;

    var index = this.currentBatchSize * 4 * 6;

    worldTransform = tilingSprite.worldTransform;

    var a = worldTransform[0];
    var b = worldTransform[3];
    var c = worldTransform[1];
    var d = worldTransform[4];
    var tx = worldTransform[2];
    var ty = worldTransform[5];

    // xy
    verticies[index++] = a * w1 + c * h1 + tx;
    verticies[index++] = d * h1 + b * w1 + ty;
    // uv
    verticies[index++] = uvs[0];
    verticies[index++] = uvs[1];
    // color
    verticies[index++] = alpha;
    verticies[index++] = tint;

    // xy
    verticies[index++] = a * w0 + c * h1 + tx;
    verticies[index++] = d * h1 + b * w0 + ty;
    // uv
    verticies[index++] = uvs[2];
    verticies[index++] = uvs[3];
    // color
    verticies[index++] = alpha;
    verticies[index++] = tint;
    
    // xy
    verticies[index++] = a * w0 + c * h0 + tx;
    verticies[index++] = d * h0 + b * w0 + ty;
    // uv
    verticies[index++] = uvs[4];
    verticies[index++] = uvs[5];
    // color
    verticies[index++] = alpha;
    verticies[index++] = tint;

    // xy
    verticies[index++] = a * w1 + c * h0 + tx;
    verticies[index++] = d * h0 + b * w1 + ty;
    // uv
    verticies[index++] = uvs[6];
    verticies[index++] = uvs[7];
    // color
    verticies[index++] = alpha;
    verticies[index++] = tint;

    // increment the batchs
    this.currentBatchSize++;
}

PIXI.WebGLSpriteBatch.prototype.flush = function()
{
    // first draw

    if (this.currentBatchSize===0)return;

    var gl = this.gl;
    
     //setup our vertex attributes & binds textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.currentBaseTexture._glTexture);

    // bind the index
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    //bind our vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    // Only update a region of the buffer. On my computer 
    // this is faster (especially if you are not filling the entire batch)
    // but it could do with more testing. In theory it SHOULD be faster
    // since bufferData allocates memory, whereas this should not.
    var view = this.vertices.subarray(0, this.currentBatchSize * 4 * 6);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    
    gl.drawElements(gl.TRIANGLES, this.currentBatchSize * 6, gl.UNSIGNED_SHORT, 0);
   
    // then reset!
    this.currentBatchSize = 0;

    this.renderSession.drawCount++;
}

PIXI.WebGLSpriteBatch.prototype.stop = function()
{
    this.flush();
}

PIXI.WebGLSpriteBatch.prototype.start = function()
{
    var gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    var stride = 6 * 4;

    var projection = this.renderSession.projection;

    gl.uniform2f(PIXI.defaultShader.projectionVector, projection.x, projection.y);

    gl.vertexAttribPointer(PIXI.defaultShader.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(PIXI.defaultShader.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * 4);
    gl.vertexAttribPointer(PIXI.defaultShader.colorAttribute, 2, gl.FLOAT, false, stride, 4 * 4);

   
    if(this.currentBlendMode !== PIXI.blendModes.NORMAL)
    {
        this.setBlendMode(PIXI.blendModes.NORMAL);
    }
}

PIXI.WebGLSpriteBatch.prototype.setBlendMode = function(blendMode)
{
    this.flush();

    this.currentBlendMode = blendMode;
    
    var blendModeWebGL = PIXI.blendModesWebGL[this.currentBlendMode];

    this.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
}


