/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 *
 * Heavily inspired by LibGDX's WebGLSpriteBatch:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/WebGLSpriteBatch.java
 */

/**
 * @class
 * @private
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this sprite batch works for.
 */
function WebGLFastSpriteBatch(renderer)
{
    /**
     * The renderer instance this sprite batch operates on.
     *
     * @member {WebGLRenderer}
     */
    this.renderer = renderer;

    /**
     *
     *
     * @member {number}
     */
    this.vertSize = 10;

    /**
     *
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     *
     *
     * @member {number}
     */
    this.maxSize = 6000;//Math.pow(2, 16) /  this.vertSize;

    /**
     *
     *
     * @member {number}
     */
    this.size = this.maxSize;

    //the total number of floats in our batch
    var numVerts = this.size * this.vertByteSize;

    //the total number of indices in our batch
    var numIndices = this.maxSize * 6;

    /**
     * Vertex data
     *
     * @member {Float32Array}
     */
    this.vertices = new Float32Array(numVerts);

    /**
     * Index data
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array(numIndices);

    /**
     *
     *
     * @member {object}
     */
    this.vertexBuffer = null;

    /**
     *
     *
     * @member {object}
     */
    this.indexBuffer = null;

    /**
     *
     *
     * @member {number}
     */
    this.lastIndexCount = 0;

    for (var i=0, j=0; i < numIndices; i += 6, j += 4)
    {
        this.indices[i + 0] = j + 0;
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    }

    /**
     *
     *
     * @member {boolean}
     */
    this.drawing = false;

    /**
     *
     *
     * @member {number}
     */
    this.currentBatchSize = 0;

    /**
     *
     *
     * @member {BaseTexture}
     */
    this.currentBaseTexture = null;

    /**
     *
     *
     * @member {number}
     */
    this.currentBlendMode = 0;

    /**
     *
     *
     * @member {object}
     */
    this.shader = null;

    /**
     *
     *
     * @member {Matrix}
     */
    this.matrix = null;

    // listen for context and update necessary buffers
    var self = this;
    this.renderer.on('context', function ()
    {
        self.setupContext();
    });
}

WebGLFastSpriteBatch.prototype.constructor = WebGLFastSpriteBatch;
module.exports = WebGLFastSpriteBatch;

/**
 * Sets the WebGL Context.
 *
 * @param gl {WebGLContext} the current WebGL drawing context
 */
WebGLFastSpriteBatch.prototype.setupContext = function ()
{
    var gl = this.renderer.gl;

    // create a couple of buffers
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    // 65535 is max index, so 65535 / 6 = 10922.

    //upload the index data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
};

/**
 * @param spriteBatch {SpriteBatch} The SpriteBatch container to prepare for.
 */
WebGLFastSpriteBatch.prototype.begin = function (spriteBatch)
{
    this.shader = this.renderer.shaderManager.plugins.fastShader;

    this.matrix = spriteBatch.worldTransform.toArray(true);

    this.start();
};

/**
 */
WebGLFastSpriteBatch.prototype.end = function ()
{
    this.flush();
};

/**
 * @param spriteBatch {SpriteBatch} The SpriteBatch container to render.
 */
WebGLFastSpriteBatch.prototype.render = function (spriteBatch)
{
    var children = spriteBatch.children;
    var sprite = children[0];

    // if the uvs have not updated then no point rendering just yet!

    // check texture.
    if (!sprite.texture._uvs)
    {
        return;
    }

    this.currentBaseTexture = sprite.texture.baseTexture;

    // check blend mode
    if (sprite.blendMode !== this.renderer.blendModeManager.currentBlendMode)
    {
        this.flush();
        this.renderer.blendModeManager.setBlendMode(sprite.blendMode);
    }

    for (var i=0,j= children.length; i<j; i++)
    {
        this.renderSprite(children[i]);
    }

    this.flush();
};

/**
 * @param sprite {Sprite} The Sprite to render.
 */
WebGLFastSpriteBatch.prototype.renderSprite = function (sprite)
{
    //sprite = children[i];
    if (!sprite.visible)
    {
        return;
    }

    // TODO trim??
    if (sprite.texture.baseTexture !== this.currentBaseTexture)
    {
        this.flush();
        this.currentBaseTexture = sprite.texture.baseTexture;

        if (!sprite.texture._uvs)
        {
            return;
        }
    }

    var uvs, vertices = this.vertices, width, height, w0, w1, h0, h1, index;

    uvs = sprite.texture._uvs;

    width = sprite.texture.frame.width;
    height = sprite.texture.frame.height;

    if (sprite.texture.trim)
    {
        // if the sprite is trimmed then we need to add the extra space before transforming the sprite coords..
        var trim = sprite.texture.trim;

        w1 = trim.x - sprite.anchor.x * trim.width;
        w0 = w1 + sprite.texture.crop.width;

        h1 = trim.y - sprite.anchor.y * trim.height;
        h0 = h1 + sprite.texture.crop.height;
    }
    else
    {
        w0 = (sprite.texture.frame.width ) * (1-sprite.anchor.x);
        w1 = (sprite.texture.frame.width ) * -sprite.anchor.x;

        h0 = sprite.texture.frame.height * (1-sprite.anchor.y);
        h1 = sprite.texture.frame.height * -sprite.anchor.y;
    }

    index = this.currentBatchSize * this.vertByteSize;

    // xy
    vertices[index++] = w1;
    vertices[index++] = h1;

    vertices[index++] = sprite.position.x;
    vertices[index++] = sprite.position.y;

    //scale
    vertices[index++] = sprite.scale.x;
    vertices[index++] = sprite.scale.y;

    //rotation
    vertices[index++] = sprite.rotation;

    // uv
    vertices[index++] = uvs.x0;
    vertices[index++] = uvs.y1;
    // color
    vertices[index++] = sprite.alpha;


    // xy
    vertices[index++] = w0;
    vertices[index++] = h1;

    vertices[index++] = sprite.position.x;
    vertices[index++] = sprite.position.y;

    //scale
    vertices[index++] = sprite.scale.x;
    vertices[index++] = sprite.scale.y;

     //rotation
    vertices[index++] = sprite.rotation;

    // uv
    vertices[index++] = uvs.x1;
    vertices[index++] = uvs.y1;
    // color
    vertices[index++] = sprite.alpha;


    // xy
    vertices[index++] = w0;
    vertices[index++] = h0;

    vertices[index++] = sprite.position.x;
    vertices[index++] = sprite.position.y;

    //scale
    vertices[index++] = sprite.scale.x;
    vertices[index++] = sprite.scale.y;

     //rotation
    vertices[index++] = sprite.rotation;

    // uv
    vertices[index++] = uvs.x2;
    vertices[index++] = uvs.y2;
    // color
    vertices[index++] = sprite.alpha;




    // xy
    vertices[index++] = w1;
    vertices[index++] = h0;

    vertices[index++] = sprite.position.x;
    vertices[index++] = sprite.position.y;

    //scale
    vertices[index++] = sprite.scale.x;
    vertices[index++] = sprite.scale.y;

     //rotation
    vertices[index++] = sprite.rotation;

    // uv
    vertices[index++] = uvs.x3;
    vertices[index++] = uvs.y3;
    // color
    vertices[index++] = sprite.alpha;

    // increment the batchs
    this.currentBatchSize++;

    if (this.currentBatchSize >= this.size)
    {
        this.flush();
    }
};

/**
 *
 */
WebGLFastSpriteBatch.prototype.flush = function ()
{
    // If the batch is length 0 then return as there is nothing to draw
    if (this.currentBatchSize === 0)
    {
        return;
    }

    var gl = this.renderer.gl;

    // bind the current texture
    if (!this.currentBaseTexture._glTextures[gl.id])
    {
        this.renderer.updateTexture(this.currentBaseTexture, gl);
    }
    //TODO-SHOUD THIS BE ELSE??!?!?!
    else
    {
        gl.bindTexture(gl.TEXTURE_2D, this.currentBaseTexture._glTextures[gl.id]);
    }

    // upload the verts to the buffer

    if (this.currentBatchSize > ( this.size * 0.5 ) )
    {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
    }
    else
    {
        var view = this.vertices.subarray(0, this.currentBatchSize * this.vertByteSize);

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    }

    // now draw those suckas!
    gl.drawElements(gl.TRIANGLES, this.currentBatchSize * 6, gl.UNSIGNED_SHORT, 0);

    // then reset the batch!
    this.currentBatchSize = 0;

    // increment the draw count
    this.renderer.drawCount++;
};


/**
 * Ends the batch and flushes
 *
 */
WebGLFastSpriteBatch.prototype.stop = function ()
{
    this.flush();
};

/**
 *
 */
WebGLFastSpriteBatch.prototype.start = function ()
{
    var gl = this.renderer.gl;

    // bind the main texture
    gl.activeTexture(gl.TEXTURE0);

    // bind the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // set the projection
    var projection = this.renderer.projection;
    gl.uniform2f(this.shader.uniforms.projectionVector._location, projection.x, projection.y);

    // set the matrix
    gl.uniformMatrix3fv(this.shader.uniforms.uMatrix._location, false, this.matrix);

    // set the pointers
    var stride =  this.vertByteSize;

    gl.vertexAttribPointer(this.shader.attributes.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(this.shader.attributes.aPositionCoord, 2, gl.FLOAT, false, stride, 2 * 4);
    gl.vertexAttribPointer(this.shader.attributes.aScale, 2, gl.FLOAT, false, stride, 4 * 4);
    gl.vertexAttribPointer(this.shader.attributes.aRotation, 1, gl.FLOAT, false, stride, 6 * 4);
    gl.vertexAttribPointer(this.shader.attributes.aTextureCoord, 2, gl.FLOAT, false, stride, 7 * 4);
    gl.vertexAttribPointer(this.shader.attributes.aColor, 1, gl.FLOAT, false, stride, 9 * 4);
};
