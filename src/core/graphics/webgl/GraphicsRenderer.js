var utils = require('../../utils'),
    CONST = require('../../const'),
    ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    WebGLGraphicsData = require('./WebGLGraphicsData'),
    PrimitiveShader = require('./shaders/PrimitiveShader'),

    // some drawing functions..
    buildPoly = require('./utils/buildPoly'),
    buildRectangle = require('./utils/buildRectangle'),
    buildRoundedRectangle = require('./utils/buildRoundedRectangle'),
    buildCircle = require('./utils/buildCircle');



/**
 * Renders the graphics object.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this object renderer works for.
 */
function GraphicsRenderer(renderer)
{
    ObjectRenderer.call(this, renderer);

    this.graphicsDataPool = [];

    this.primitiveShader = null;

    this.gl = renderer.gl;

    // easy access!
    this.CONTEXT_UID = 0;
}

GraphicsRenderer.prototype = Object.create(ObjectRenderer.prototype);
GraphicsRenderer.prototype.constructor = GraphicsRenderer;
module.exports = GraphicsRenderer;

WebGLRenderer.registerPlugin('graphics', GraphicsRenderer);

/**
 * Called when there is a WebGL context change
 *
 * @private
 *
 */
GraphicsRenderer.prototype.onContextChange = function()
{
    this.gl = this.renderer.gl;
    this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    this.primitiveShader = new PrimitiveShader(this.gl);
};

/**
 * Destroys this renderer.
 *
 */
GraphicsRenderer.prototype.destroy = function ()
{
    ObjectRenderer.prototype.destroy.call(this);

    for (var i = 0; i < this.graphicsDataPool.length; ++i) {
        this.graphicsDataPool[i].destroy();
    }

    this.graphicsDataPool = null;
};

/**
 * Renders a graphics object.
 *
 * @param graphics {PIXI.Graphics} The graphics object to render.
 */
GraphicsRenderer.prototype.render = function(graphics)
{
    var renderer = this.renderer;
    var gl = renderer.gl;

    var webGLData;

    if (graphics.dirty || !graphics._webGL[this.CONTEXT_UID])
    {
        this.updateGraphics(graphics);
    }

    var webGL = graphics._webGL[this.CONTEXT_UID];

    // This  could be speeded up for sure!
    var shader = this.primitiveShader;
    renderer.bindShader(shader);
    renderer.state.setBlendMode( graphics.blendMode );

    for (var i = 0, n = webGL.data.length; i < n; i++)
    {
        webGLData = webGL.data[i];
        var shaderTemp = webGLData.shader;

        renderer.bindShader(shaderTemp);
        shaderTemp.uniforms.translationMatrix = graphics.transform.worldTransform.toArray(true);
        shaderTemp.uniforms.tint = utils.hex2rgb(graphics.tint);
        shaderTemp.uniforms.alpha = graphics.worldAlpha;

        webGLData.vao.bind()
        .draw(gl.TRIANGLE_STRIP,  webGLData.indices.length)
        .unbind();
    }
};

/**
 * Updates the graphics object
 *
 * @private
 * @param graphics {PIXI.Graphics} The graphics object to update
 */
GraphicsRenderer.prototype.updateGraphics = function(graphics)
{
    var gl = this.renderer.gl;

     // get the contexts graphics object
    var webGL = graphics._webGL[this.CONTEXT_UID];

    // if the graphics object does not exist in the webGL context time to create it!
    if (!webGL)
    {
        webGL = graphics._webGL[this.CONTEXT_UID] = {lastIndex:0, data:[], gl:gl};

    }

    // flag the graphics as not dirty as we are about to update it...
    graphics.dirty = false;

    var i;

    // if the user cleared the graphics object we will need to clear every object
    if (graphics.clearDirty)
    {
        graphics.clearDirty = false;

        // loop through and return all the webGLDatas to the object pool so than can be reused later on
        for (i = 0; i < webGL.data.length; i++)
        {
            var graphicsData = webGL.data[i];
            this.graphicsDataPool.push( graphicsData );
        }

        // clear the array and reset the index..
        webGL.data = [];
        webGL.lastIndex = 0;
    }

    var webGLData;

    // loop through the graphics datas and construct each one..
    // if the object is a complex fill then the new stencil buffer technique will be used
    // other wise graphics objects will be pushed into a batch..
    for (i = webGL.lastIndex; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];

        //TODO - this can be simplified
        webGLData = this.getWebGLData(webGL, 0);

        if (data.type === CONST.SHAPES.POLY)
        {
            buildPoly(data, webGLData);
        }
        if (data.type === CONST.SHAPES.RECT)
        {
            buildRectangle(data, webGLData);
        }
        else if (data.type === CONST.SHAPES.CIRC || data.type === CONST.SHAPES.ELIP)
        {
            buildCircle(data, webGLData);
        }
        else if (data.type === CONST.SHAPES.RREC)
        {
            buildRoundedRectangle(data, webGLData);
        }

        webGL.lastIndex++;
    }

    // upload all the dirty data...
    for (i = 0; i < webGL.data.length; i++)
    {
        webGLData = webGL.data[i];

        if (webGLData.dirty)
        {
            webGLData.upload();
        }
    }
};

/**
 *
 * @private
 * @param webGL {WebGLRenderingContext} the current WebGL drawing context
 * @param type {number} TODO @Alvin
 */
GraphicsRenderer.prototype.getWebGLData = function (webGL, type)
{
    var webGLData = webGL.data[webGL.data.length-1];

    if (!webGLData || webGLData.points.length > 320000)
    {
        webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(this.renderer.gl, this.primitiveShader, this.renderer.state.attribsState);
        webGLData.reset(type);
        webGL.data.push(webGLData);
    }

    webGLData.dirty = true;

    return webGLData;
};
