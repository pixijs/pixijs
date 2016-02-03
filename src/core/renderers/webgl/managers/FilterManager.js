var WebGLManager = require('./WebGLManager'),
    RenderTarget = require('../utils/RenderTarget'),
    CONST = require('../../../const'),
    Quad = require('../utils/Quad'),
    math =  require('../../../math'),
    utils =  require('../../../utils'),
    Shader = require('pixi-gl-core').GLShader,
    filterTransforms = require('../filters/filterTransforms'),
    bitTwiddle = require('bit-twiddle');

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

    // know about sprites!
    this.quad = new Quad(gl);

    var rootState = new FilterState();
    rootState.sourceFrame = rootState.destinationFrame = this.renderer.rootRenderTarget.size;
    rootState.renderTarget = renderer.rootRenderTarget;

    this.stack = [rootState];

    this.stackIndex = 0;

    this.shaderCache = {};
    // todo add default!
}

FilterManager.prototype = Object.create(WebGLManager.prototype);
FilterManager.prototype.constructor = FilterManager;
module.exports = FilterManager;

FilterManager.prototype.pushFilter = function(target, filters)
{
    var renderer = this.renderer;

    // get the current filter state..
    var currentState = this.stack[++this.stackIndex];
    if(!currentState)
    {
        currentState = this.stack[this.stackIndex] = new FilterState();
    }

    // for now we go off the filter of the first resolution..
    var resolution = filters[0].resolution;

    var targetBounds = target.filterArea || target.getBounds();
   
    var sourceFrame = currentState.sourceFrame;
    var destinationFrame = currentState.destinationFrame;

    //TODO - should this be rounded to reoultion? not 1?
    sourceFrame.x = targetBounds.x | 0;
    sourceFrame.y = targetBounds.y | 0;
    sourceFrame.width = targetBounds.width | 0;
    sourceFrame.height = targetBounds.height | 0;
    sourceFrame.pad(4 / resolution);
    sourceFrame.fit(this.stack[0].destinationFrame);

    destinationFrame.width = sourceFrame.width;
    destinationFrame.height = sourceFrame.height;

    var renderTarget = FilterManager.getPotRenderTarget(renderer.gl, sourceFrame.width, sourceFrame.height, resolution);

    currentState.target = target;
    currentState.filters = filters;
    currentState.renderTarget = renderTarget;

    // bind the render taget to draw the shape in the top corner..
    
    // bind the render target
    renderer.bindRenderTarget(renderTarget, destinationFrame, sourceFrame);

    // clear the renderTarget
    renderer.clear();
}

FilterManager.prototype.popFilter = function()
{
    var gl = this.renderer.gl;

    var lastState = this.stack[this.stackIndex-1];
    var currentState = this.stack[this.stackIndex];
    
    this.quad.map(currentState.renderTarget.size, currentState.sourceFrame).upload();
    
    var filters = currentState.filters;
    
    if(filters.length === 1)
    {
        filters[0].apply(this, currentState.renderTarget, lastState.renderTarget, true);
        FilterManager.freePotRenderTarget(currentState.renderTarget);
    }
    else
    {
        var flip = currentState.renderTarget;
        var flop = FilterManager.getPotRenderTarget(renderer.gl, currentState.sourceFrame.width, currentState.sourceFrame.height, 1);

        for (var i = 0; i < filters.length-1; i++) 
        {

            filters[i].apply(this, flip, flop, true);

            var t = flip;
            flip = flop;
            flop = t;
        };

        filters[i].apply(this, flip, lastState.renderTarget, true);

        FilterManager.freePotRenderTarget(flip);
        FilterManager.freePotRenderTarget(flop);
    }

    this.stackIndex--;
}

FilterManager.prototype.applyFilter = function (filter, input, output, clear)
{
    var renderer = this.renderer;
    var lastState = this.stack[this.stackIndex-1];
    var shader = filter.glShaders[gl.id];
    
    // cacheing..
    if(!shader)
    {
        if(filter.glShaderKey)
        {
            shader = this.shaderCache[filter.glShaderKey];

            if(!shader)
            {
                shader = filter.glShaders[gl.id] = this.shaderCache[filter.glShaderKey] = new Shader(gl, filter.vertexSrc, filter.fragmentSrc);
            }
        }
        else
        {
            shader = filter.glShaders[gl.id] = new Shader(gl, filter.vertexSrc, filter.fragmentSrc);
        }
    }
    
    renderer.bindRenderTarget(output, lastState.destinationFrame, lastState.sourceFrame);
    
    if(clear)
    {
        renderer.clear()//[1, 1, 1, 1]);
    }

    renderer.bindShader(shader);

    // this syncs the pixi filters  uniforms with glsl uniforms
    this.syncUniforms(shader, filter);

    // bind the input texture..
    input.texture.bind(0);

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
FilterManager.prototype.calculateScreenSpaceMatrix = function (outputMatrix)
{
    var currentState = this.stack[this.stackIndex];
    return filterTransforms.calculateScreenSpaceMatrix(outputMatrix,  currentState.sourceFrame, currentState.renderTarget.size);   
}

FilterManager.prototype.calculateNormalisedScreenSpaceMatrix = function (outputMatrix)
{
    var currentState = this.stack[this.stackIndex];

    

    return filterTransforms.calculateNormalisedScreenSpaceMatrix(outputMatrix, currentState.sourceFrame, currentState.renderTarget.size, currentState.destinationFrame);   
}

// this will map the filter coord so that a texture can be used based on the transform of a sprite
FilterManager.prototype.calculateSpriteMatrix = function (outputMatrix, sprite)
{
    var currentState = this.stack[this.stackIndex];
    return filterTransforms.calculateSpriteMatrix(outputMatrix, currentState.sourceFrame, currentState.renderTarget.size, sprite);
};

FilterManager.prototype.destroy = function()
{

}

//TODO move to a seperate class could be on renderer?
//also - could cause issue with multiple contexts?
FilterManager.getPotRenderTarget = function(gl, minWidth, minHeight, resolution)
{
    //TODO you coud return a bigger texture if there is not one in the pool?
    minWidth = bitTwiddle.nextPow2(minWidth * resolution);
    minHeight = bitTwiddle.nextPow2(minHeight * resolution);

    var key = ((minWidth & 0xFFFF) << 16) | ( minHeight & 0xFFFF);

    if(!FilterManager.pool[key])FilterManager.pool[key] = [];

    var renderTarget = FilterManager.pool[key].pop() || new RenderTarget(gl, minWidth, minHeight, null, 1);
    
    //manually tweak the resolution...
    //this will not modify the size of the frame buffer, just its resolution.
    renderTarget.resolution = resolution;
    renderTarget.defaultFrame.width = renderTarget.size.width = minWidth / resolution;
    renderTarget.defaultFrame.height = renderTarget.size.height = minHeight / resolution;

    return renderTarget;
}

FilterManager.freePotRenderTarget = function(renderTarget)
{
    var minWidth = renderTarget.size.width * renderTarget.resolution;
    var minHeight = renderTarget.size.height * renderTarget.resolution;

    var key = ((minWidth & 0xFFFF) << 16) | (minHeight & 0xFFFF);
    FilterManager.pool[key].push(renderTarget)
}

var FilterState = function()
{
    this.renderTarget = null;
    this.sourceFrame = new math.Rectangle();
    this.destinationFrame = new math.Rectangle();
    this.filters = [];
    this.target = null;
}

FilterManager.pool = {}

