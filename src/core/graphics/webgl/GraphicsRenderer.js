var utils = require('../../utils'),
    math = require('../../math'),
    CONST = require('../../const'),
    ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    WebGLGraphicsData = require('./WebGLGraphicsData'),
    PrimitiveShader = require('./shaders/PrimitiveShader'),

    // some drawing functions..
    buildLine = require('./utils/buildLine');
    buildPoly = require('./utils/buildPoly');
    buildComplexPoly = require('./utils/buildComplexPoly');
    buildRectangle = require('./utils/buildRectangle');
    buildRoundedRectangle = require('./utils/buildRoundedRectangle');
    buildCircle = require('./utils/buildCircle');

    earcut = require('earcut');

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
    this.complexPrimitiveShader = null;

    this.gl = renderer.gl;

    /**
     * This is the maximum number of points a poly can contain before it is rendered as a complex polygon (using the stencil buffer)
     * @type {Number}
     */
    this.maximumSimplePolySize = 200;
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
    this.primitiveShader = new PrimitiveShader(this.gl)
};

/**
 * Destroys this renderer.
 *
 */
GraphicsRenderer.prototype.destroy = function () {
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
  //  console.log(graphics)
    if (graphics.dirty || !graphics._webGL[gl.id])
    {
        this.updateGraphics(graphics);
    }

    var webGL = graphics._webGL[gl.id];

    // This  could be speeded up for sure!

    renderer.blendModeManager.setBlendMode( graphics.blendMode );

//    var matrix =  graphics.worldTransform.clone();
//    var matrix =  renderer.currentRenderTarget.projectionMatrix.clone();
//    matrix.append(graphics.worldTransform);

    for (var i = 0, n = webGL.data.length; i < n; i++)
    {
        webGLData = webGL.data[i];

        if (webGL.data[i].mode === 1)
        {
            //TODO fix this one!
            
            /*
            renderer.stencilManager.pushStencil(graphics, webGLData);

            gl.uniform1f(renderer.shaderManager.complexPrimitiveShader.uniforms.alpha._location, graphics.worldAlpha * webGLData.alpha);

            // render quad..
            gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, ( webGLData.indices.length - 4 ) * 2 );

            renderer.stencilManager.popStencil(graphics, webGLData);
            */
        }
        else
        {

            shader = this.primitiveShader;

            renderer.bindShader(shader)

            shader.uniforms.translationMatrix = graphics.worldTransform.toArray(true);
            shader.uniforms.tint = utils.hex2rgb(graphics.tint);
            shader.uniforms.alpha = graphics.worldAlpha;


            gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);

            shader = this.primitiveShader;

            shader.attributes.aVertexPosition.pointer(gl.FLOAT, false, 4 * 6, 0);
            shader.attributes.aColor.pointer(gl.FLOAT, false, 4 * 6, 2 * 4);

            gl.enableVertexAttribArray(shader.attributes.aVertexPosition.location);
            gl.enableVertexAttribArray(shader.attributes.aColor.location);

            // set the index buffer!
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP,  webGLData.indices.length, gl.UNSIGNED_SHORT, 0 );
        }

        renderer.drawCount++;
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
    var webGL = graphics._webGL[gl.id];

    // if the graphics object does not exist in the webGL context time to create it!
    if (!webGL)
    {
        webGL = graphics._webGL[gl.id] = {lastIndex:0, data:[], gl:gl};
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
            graphicsData.reset();
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

        if (data.type === CONST.SHAPES.POLY)
        {
            // need to add the points the the graphics object..
            data.points = data.shape.points.slice();
            if (data.shape.closed)
            {
                // close the poly if the value is true!
                if (data.points[0] !== data.points[data.points.length-2] || data.points[1] !== data.points[data.points.length-1])
                {
                    data.points.push(data.points[0], data.points[1]);
                }
            }

            // MAKE SURE WE HAVE THE CORRECT TYPE..
            if (data.fill)
            {
                if (data.points.length >= 6)
                {
                    if (data.points.length < this.maximumSimplePolySize * 2)
                    {
                        webGLData = this.switchMode(webGL, 0);

                        var canDrawUsingSimple = buildPoly(data, webGLData);

                        if (!canDrawUsingSimple)
                        {
                            webGLData = this.switchMode(webGL, 1);
                            buildComplexPoly(data, webGLData);
                        }

                    }
                    else
                    {
                        webGLData = this.switchMode(webGL, 1);
                        buildComplexPoly(data, webGLData);
                    }
                }
            }

            if (data.lineWidth > 0)
            {
                webGLData = this.switchMode(webGL, 0);
                buildLine(data, webGLData);
            }
        }
        else
        {
            webGLData = this.switchMode(webGL, 0);

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
 *
 * @private
 * @param webGL {WebGLRenderingContext} the current WebGL drawing context
 * @param type {number} TODO @Alvin
 */
GraphicsRenderer.prototype.switchMode = function (webGL, type)
{
    var webGLData;

    if (!webGL.data.length)
    {
        webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(webGL.gl);
        webGLData.mode = type;
        webGL.data.push(webGLData);
    }
    else
    {
        webGLData = webGL.data[webGL.data.length-1];

        if ((webGLData.points.length > 320000) || webGLData.mode !== type || type === 1)
        {
            webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(webGL.gl);
            webGLData.mode = type;
            webGL.data.push(webGLData);
        }
    }

    webGLData.dirty = true;

    return webGLData;
};

