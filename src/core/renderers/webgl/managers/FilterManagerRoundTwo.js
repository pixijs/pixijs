var WebGLManager = require('./WebGLManager'),
    RenderTarget = require('../utils/RenderTarget'),
    CONST = require('../../../const'),
    Quad = require('../utils/Quad'),
    FilterShader = require('../filters/FilterShader'),
    math =  require('../../../math'),
    utils =  require('../../../utils'),
    Shader = require('pixi-gl-core').GLShader;

var tempMatrix = new math.Matrix();
var tempRect = new math.Rectangle();

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.WebGLManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function FilterManager(renderer)
{
    WebGLManager.call(this, renderer);

    // TODO - not really required. but useful for setting the quad..
    this.filterShader = new FilterShader(renderer.gl);
    // know about sprites!
    this.quad = new Quad(gl, this.filterShader);

    this.stack = [];

}

FilterManager.prototype = Object.create(WebGLManager.prototype);
FilterManager.prototype.constructor = FilterManager;
module.exports = FilterManager;

FilterManager.prototype.pushFilter = function(target, filters)
{
    var bounds = target.getBounds();

    var renderTarget = FilterManager.getPotRenderTarget(this.renderer.gl, bounds.width, bounds.height);
   
    this.stack.push({
        target:target,
        bounds:bounds,
        filters:filters,
        renderTarget:renderTarget
    });


   // bind the render taget to draw the shape in the top corner..
   tempRect.width = bounds.width;
   tempRect.height = bounds.height;

    this.renderer.bindRenderTarget(renderTarget, tempRect, bounds)
    .clear();
}

FilterManager.prototype.popFilter = function()
{
    //TOOD - add scissor to 'clip a large object?'
    //
    var gl = this.renderer.gl;

    var last = this.stack.pop();
    var renderTarget = last.renderTarget;
    var target = last.target;
    var bounds = last.bounds;
    var filters = last.filters;

    this.bounds = bounds;

    var panda = panda;

    this.quad.map(renderTarget.size, bounds).upload();

    var filter = filters[0];

    filter.apply(this, renderTarget, this.renderer.rootRenderTarget, false);


    // return the texture..
    FilterManager.freePotRenderTarget(renderTarget);
}

FilterManager.prototype.applyFilter = function (filter, input, output, clear)
{
    var shader = filter.glShaders[gl.id];
    if(!shader)
    {
        shader = filter.glShaders[gl.id] = new Shader(gl, filter.vertexSrc, filter.fragmentSrc);
    }
    
    this.renderer.bindRenderTarget(output);
    this.renderer.bindShader(shader);

    this.syncUniforms(shader, filter);

    // bind th einput texture..
    input.texture.bind(0);
        
    shader.uniforms.filterMatrix = this.calculateSpriteMatrix(tempMatrix, this.bounds, input.size, window.panda ).toArray(true);

    this.quad.draw();
}

// thia returns a matrix that will normalise map filter cords in the filter to screen space
FilterManager.prototype.syncUniforms = function (shader, filter)
{
    var uniformData = filter.uniformData;
    var uniforms = filter.uniforms;

    // 0 is reserverd for the pixi texture so we start at 1!
    var textureCount = 1;

    for(var i in uniformData)
    {
        if(uniformData[i].type === 'sampler2D')
        {
            shader.uniforms[i] = textureCount;
            this.renderer.bindTexture(uniforms[i].baseTexture, textureCount);

            textureCount++;
        }      
    }
}

/*
 * Calculates the mapped matrix
 * @param filterArea {Rectangle} The filter area
 * @param sprite {Sprite} the target sprite
 * @param outputMatrix {Matrix} @alvin
 */
// TODO playing around here.. this is temporary - (will end up in the shader)
// thia returns a matrix that will normalise map filter cords in the filter to screen space
FilterManager.prototype.calculateScreenSpaceMatrix = function (outputMatrix, filterArea, textureSize)
{
    var mappedMatrix = outputMatrix;
    mappedMatrix.a = textureSize.width;
    mappedMatrix.b = 0;
    mappedMatrix.c = 0;
    mappedMatrix.d = textureSize.height;
    mappedMatrix.tx = filterArea.x;
    mappedMatrix.ty = filterArea.y;

    return mappedMatrix;
}

FilterManager.prototype.calculateNormalisedScreenSpaceMatrix = function (outputMatrix, filterArea, textureSize)
{
    var mappedMatrix = outputMatrix;
    mappedMatrix.a = textureSize.width / this.renderer.width;
    mappedMatrix.b = 0;
    mappedMatrix.c = 0;
    mappedMatrix.d = textureSize.height / this.renderer.height;
    mappedMatrix.tx = filterArea.x / this.renderer.width;
    mappedMatrix.ty = filterArea.y / this.renderer.height;

    return mappedMatrix;
}

// this will map the filter coord so that a texture can be used based on the transform of a sprite
FilterManager.prototype.calculateSpriteMatrix = function (outputMatrix, filterArea, textureSize, sprite)
{
    var worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
    texture = sprite._texture.baseTexture;

    // TODO unwrap?
    var mappedMatrix = outputMatrix.identity();

    // scale..
    var ratio = textureSize.height / textureSize.width;

    mappedMatrix.translate(filterArea.x / textureSize.width, filterArea.y / textureSize.height );

    mappedMatrix.scale(1 , ratio);

    var translateScaleX = (textureSize.width / texture.width);
    var translateScaleY = (textureSize.height / texture.height);

    worldTransform.tx /= texture.width * translateScaleX;
 
    //this...?
    //   worldTransform.ty /= texture.width * translateScaleX;
    worldTransform.ty /= texture.height * translateScaleY;

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
};

FilterManager.prototype.resize = function(width, height)
{
    //TODO remove! no longer required :D
}

FilterManager.prototype.destroy = function()
{

}

//TODO move to a seperate class
FilterManager.getPotRenderTarget = function(gl, minWidth, minHeight)
{
    //TODO you coud return a bigger texture if there is not one in the pool?
    minWidth = utils.getNextPowerOfTwo(minWidth);
    minHeight = utils.getNextPowerOfTwo(minHeight);

    var key = ((minWidth & 0xFFFF) << 16) | ( minHeight & 0xFFFF);

    if(!FilterManager.pool[key])FilterManager.pool[key] = [];

    return FilterManager.pool[key].pop() || new RenderTarget(gl, minWidth, minHeight);
}

FilterManager.freePotRenderTarget = function(renderTarget)
{
    var key = ((renderTarget.size.width & 0xFFFF) << 16) | ( renderTarget.size.height & 0xFFFF);
    FilterManager.pool[key].push(renderTarget)
}

FilterManager.pool = {}

