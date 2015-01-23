var WebGLManager = require('./WebGLManager'),
    FilterTexture = require('../utils/FilterTexture'),
    RenderTarget = require('../utils/RenderTarget');
    DefaultShader = require('../shaders/DefaultShader'),

    Quad = require('./Quad'),
    math =  require('../../../math');

/**
 * @class
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this manager works for.
 */
function FilterManager(renderer)
{
    WebGLManager.call(this, renderer);

    this.count = 0;

    /**
     * @member {any[]}
     */
    this.filterStack = [];

    this.filterStack.push({
        renderTarget:renderer.currentRenderTarget,
        filter:[],
        bounds:null
    });

    /**
     * @member {any[]]}
     */
    this.texturePool = [];

    // listen for context and update necessary buffers
    //TODO make this dynamic!
    this.textureSize = new math.Rectangle(0, 0, 800, 600);

    this.tempMatrix = new math.Matrix();
}

FilterManager.prototype = Object.create(WebGLManager.prototype);
FilterManager.prototype.constructor = FilterManager;
module.exports = FilterManager;


FilterManager.prototype.onContextChange = function ()
{
    this.texturePool.length = 0;
    this.initShaderBuffers();
}

/**
 * @param renderer {WebGLRenderer}
 * @param buffer {ArrayBuffer}
 */
FilterManager.prototype.begin = function (buffer)
{
    //TODO sort out bounds - no point creating a new rect each frame!
    //this.defaultShader = this.renderer.shaderManager.plugins.defaultShader;
    this.filterStack[0].renderTarget = this.renderer.currentRenderTarget;
    this.filterStack[0].bounds = new math.Rectangle(0, 0, this.renderer.currentRenderTarget.width, this.renderer.currentRenderTarget.height);
};

/**
 * Applies the filter and adds it to the current filter stack.
 *
 * @param filterBlock {object} the filter that will be pushed to the current filter stack
 */
FilterManager.prototype.pushFilter = function (target, filters)
{
    var gl = this.renderer.gl;
    //console.log("push")
    // get the bounds of the object..
    var bounds = target.filterArea || target.getBounds();

    this.capFilterArea( bounds );

    var texture = this.texturePool.pop() || new RenderTarget(this.renderer.gl, this.textureSize.width, this.textureSize.height);

    //  texture.
    // TODO setting frame is lame..
    texture.frame = bounds;//new math.Rectangle(, 0, this.realSize.width, this.realSize.height);
    texture.activate();
    
    // clear the texture..
    texture.clear();
    
    this.renderer.currentRenderTarget = texture;

    // TODO get rid of object creation!
    this.filterStack.push({
        renderTarget:texture,
        filter:filters,
        bounds:bounds
    });

};


/**
 * Removes the last filter from the filter stack and doesn't return it.
 *
 */
FilterManager.prototype.popFilter = function ()
{
    var filterData = this.filterStack.pop();
    

    var input = filterData.renderTarget;

    // use program
    var gl = this.renderer.gl;
    var filter = filterData.filter[0];
    var shader = filter.shaders[gl.id];

    // shader.syncUniforms();

    this.quad.map(this.textureSize, filterData.bounds);

    //
    if (!shader)
    {
        shader = new DefaultShader(this,
            filter.vertexSrc,
            filter.fragmentSrc,
            filter.uniforms,
            filter.attributes
        );

        filter.shaders[gl.id] = shader;
    }

    // set the shader
    this.renderer.shaderManager.setShader(shader);

    // RENDER 
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad.vertexBuffer);
    
    gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 2 * 4 * 4);
    gl.vertexAttribPointer(shader.attributes.aColor, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quad.indexBuffer);

    // draw the filter...

    var previousFilter = this.filterStack[this.filterStack.length-1];

    this.renderer.currentRenderTarget = previousFilter.renderTarget;
    
    this.renderer.currentRenderTarget.frame = previousFilter.bounds;
    this.renderer.currentRenderTarget.activate();
    
    gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, this.renderer.currentRenderTarget.projectionMatrix.toArray(true));

    var m = this.calculateMappedMatrix(filterData.bounds, filter.sprite)
    ///  m.ty = 0.1;
    //m.translate(0.5,0.5)
    // m.a = 2;
    gl.uniformMatrix3fv(shader.uniforms.otherMatrix._location, false, m.toArray(true));

    /// custom //
    this.textureCount = 1;
    gl.activeTexture(gl.TEXTURE1);

    var maskTexture = filter.uniforms.mask.value.baseTexture;

    if (!maskTexture._glTextures[gl.id])
    {
        this.renderer.updateTexture(maskTexture);
    }
    else
    {
        // bind the texture
        gl.bindTexture(gl.TEXTURE_2D, filter.uniforms.mask.value.baseTexture._glTextures[gl.id]);
    }

    
    // set uniform to texture index
    gl.uniform1i(filter.uniforms.mask._location, 1);

    // increment next texture id
    this.textureCount++;

            

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input.texture);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );

    this.texturePool.push(filterData.renderTarget);

    return filterData.filter;
};


// TODO playing around here.. this is temporary - (will end up in the shader)
FilterManager.prototype.calculateMappedMatrix = function (filterArea, sprite)
{
    var worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX);
    var texture = sprite.texture.baseTexture;

    var mappedMatrix = this.tempMatrix.identity();

    // scale..
    var ratio = this.textureSize.height / this.textureSize.width;

    mappedMatrix.translate(filterArea.x / this.textureSize.width, filterArea.y / this.textureSize.height );
    
    mappedMatrix.scale(1 , ratio);

    var translateScaleX = (this.textureSize.width / texture.width);
    var translateScaleY = (this.textureSize.height / texture.height);

    worldTransform.tx /= texture.width * translateScaleX;
    worldTransform.ty /= texture.width * translateScaleX;

    worldTransform.invert();

    mappedMatrix.prepend(worldTransform);

    // apply inverse scale..
    mappedMatrix.scale(1 , 1/ratio);

    mappedMatrix.scale( translateScaleX , translateScaleY );

    mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

    return mappedMatrix;

    // Keeping the orginal as a reminder to me on how this works!
    //
    // var m = new math.Matrix();

    // // scale..
    // var ratio = this.textureSize.height / this.textureSize.width;

    // m.translate(filterArea.x / this.textureSize.width, filterArea.y / this.textureSize.height);
    

    // m.scale(1 , ratio);


    // var transform = wt.clone();
    
    // var translateScaleX = (this.textureSize.width / 620);
    // var translateScaleY = (this.textureSize.height / 380);

    // transform.tx /= 620 * translateScaleX;
    // transform.ty /= 620 * translateScaleX;

    // transform.invert();

    // transform.append(m);

    // // apply inverse scale..
    // transform.scale(1 , 1/ratio);

    // transform.scale( translateScaleX , translateScaleY );

    // return transform;
}

FilterManager.prototype.capFilterArea = function (filterArea)
{
    if (filterArea.x < 0)
    {
        filterArea.width += filterArea.x;
        filterArea.x = 0;
    }

    if (filterArea.y < 0)
    {
        filterArea.height += filterArea.y;
        filterArea.y = 0;
    }

    if ( filterArea.x + filterArea.width > this.textureSize.width )
    {
        filterArea.width = this.textureSize.width - filterArea.x;
    }

    if ( filterArea.y + filterArea.height > this.textureSize.height )
    {
        filterArea.height = this.textureSize.height - filterArea.y;
    }
}


/**
 * Initialises the shader buffers.
 *
 */
FilterManager.prototype.initShaderBuffers = function ()
{
    var gl = this.renderer.gl;
    this.quad = new Quad(gl);
};

/**
 * Destroys the filter and removes it from the filter stack.
 *
 */
FilterManager.prototype.destroy = function ()
{
    var gl = this.renderer.gl;

    this.filterStack = null;
    this.offsetY = 0;

    // destroy textures
    for (var i = 0; i < this.texturePool.length; i++)
    {
        this.texturePool[i].destroy();
    }

    this.texturePool = null;
};
