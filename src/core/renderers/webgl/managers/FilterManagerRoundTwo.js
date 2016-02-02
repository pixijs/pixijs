var WebGLManager = require('./WebGLManager'),
    RenderTarget = require('../utils/RenderTarget'),
    CONST = require('../../../const'),
    Quad = require('../utils/Quad'),
    FilterShader = require('../filters/FilterShader'),
    math =  require('../../../math'),
    utils =  require('../../../utils'),
    Shader = require('pixi-gl-core').GLShader,
    filterTransforms = require('../filters/filterTransforms');

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
    this.stackIndex = -1;
    // todo add default!
}

FilterManager.prototype = Object.create(WebGLManager.prototype);
FilterManager.prototype.constructor = FilterManager;
module.exports = FilterManager;

FilterManager.prototype.pushFilter = function(target, filters)
{

    var bounds = target.getBounds();
    bounds.pad(4);
    bounds.fit(new PIXI.Rectangle(0,0,800, 800)) //TODO - output.size?

    var renderTarget = FilterManager.getPotRenderTarget(this.renderer.gl, bounds.width, bounds.height);
    
    this.stackIndex++;

    if(!this.stack[this.stackIndex])
    {
        this.stack[this.stackIndex] = {
            target:target,
            bounds:bounds,
            filters:filters,
            renderTarget:renderTarget
        }
    }
    else
    {
        var currentState = this.stack[this.stackIndex];
        currentState.target = target;
        currentState.bounds = bounds;
        currentState.filters = filters;
        currentState.renderTarget = renderTarget;
    }

    // bind the render taget to draw the shape in the top corner..
    tempRect.width = bounds.width;
    tempRect.height = bounds.height;

    this.renderer.bindRenderTarget(renderTarget, tempRect, bounds)
    
    this.renderer.clear();
}

FilterManager.prototype.popFilter = function()
{
    var gl = this.renderer.gl;

    var currentState = this.stack[this.stackIndex];
    
    this.quad.map(currentState.renderTarget.size, currentState.bounds).upload();

    var filter = currentState.filters[0];

    filter.apply(this, currentState.renderTarget, this.renderer.rootRenderTarget, false);

    // return the texture..
    FilterManager.freePotRenderTarget(currentState.renderTarget);

    this.stackIndex--;
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
   // console.log(shader.uniforms.filterMatrix);
    // bind th einput texture..
    input.texture.bind(0);
        
    // stack shaders..
    var currentState = this.stack[this.stackIndex];

    
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
        else if(uniformData[i].type === 'mat3')
        {   
            // check if its pixi matrix..
            if(uniforms[i].a)
            {
                shader.uniforms[i] = uniforms[i].toArray(true);
            }
            else
            {
                shader.uniforms[i] = uniforms[i];
            }
        }
        else if(uniformData[i].type === 'vec2')
        {
            //check if its a point..
           if(uniforms[i].x) 
           {
                val = shader.uniforms[i];
                val[0] = uniforms[i].x;
                val[1] = uniforms[i].y;
                shader.uniforms[i] = val;
           }
           else
           {
                shader.uniforms[i] = uniforms[i];
           }
        }
        else
        {
            shader.uniforms[i] = uniforms[i];
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
    var currentState = this.stack[this.stackIndex];
    var screenSize = new math.Rectangle(0,0, this.renderer.width, this.renderer.height);

    return filterTransforms.calculateScreenSpaceMatrix(outputMatrix, filterArea, textureSize);   
}

FilterManager.prototype.calculateNormalisedScreenSpaceMatrix = function (outputMatrix)
{
    var currentState = this.stack[this.stackIndex];
    var screenSize = new math.Rectangle(0,0, this.renderer.width, this.renderer.height);

    return filterTransforms.calculateNormalisedScreenSpaceMatrix(outputMatrix, currentState.bounds, currentState.renderTarget.size, screenSize);   
}

// this will map the filter coord so that a texture can be used based on the transform of a sprite
FilterManager.prototype.calculateSpriteMatrix = function (outputMatrix, sprite)
{
    var currentState = this.stack[this.stackIndex];
    return filterTransforms.calculateSpriteMatrix(outputMatrix, currentState.bounds, currentState.renderTarget.size, sprite);
};

FilterManager.prototype.resize = function(width, height)
{
    //TODO remove! no longer required :D
}

FilterManager.prototype.destroy = function()
{

}

//TODO move to a seperate class could be on renderer?
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

