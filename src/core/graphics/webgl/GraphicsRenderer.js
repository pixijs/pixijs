import utils from '../../utils';
import CONST from '../../const';
import ObjectRenderer from '../../renderers/webgl/utils/ObjectRenderer';
import WebGLRenderer from '../../renderers/webgl/WebGLRenderer';
import WebGLGraphicsData from './WebGLGraphicsData';
import PrimitiveShader from './shaders/PrimitiveShader';

import buildPoly from './utils/buildPoly';
import buildRectangle from './utils/buildRectangle';
import buildRoundedRectangle from './utils/buildRoundedRectangle';
import buildCircle from './utils/buildCircle';

/**
 * Renders the graphics object.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this object renderer works for.
 */
class GraphicsRenderer extends ObjectRenderer
{
    constructor(renderer)
    {
        super(renderer);

        this.graphicsDataPool = [];

        this.primitiveShader = null;

        this.gl = renderer.gl;

        // easy access!
        this.CONTEXT_UID = 0;
    }

    /**
     * Called when there is a WebGL context change
     *
     * @private
     *
     */
    onContextChange()
    {
        this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
        this.primitiveShader = new PrimitiveShader(this.gl);
    }

    /**
     * Destroys this renderer.
     *
     */
    destroy()
    {
        ObjectRenderer.prototype.destroy.call(this);

        for (let i = 0; i < this.graphicsDataPool.length; ++i) {
            this.graphicsDataPool[i].destroy();
        }

        this.graphicsDataPool = null;
    }

    /**
     * Renders a graphics object.
     *
     * @param graphics {PIXI.Graphics} The graphics object to render.
     */
    render(graphics)
    {
        let renderer = this.renderer;
        let gl = renderer.gl;

        let webGLData;

        let webGL = graphics._webGL[this.CONTEXT_UID];

        if (!webGL || graphics.dirty !== webGL.dirty )
        {

            this.updateGraphics(graphics);

            webGL = graphics._webGL[this.CONTEXT_UID];
        }



        // This  could be speeded up for sure!
        let shader = this.primitiveShader;
        renderer.bindShader(shader);
        renderer.state.setBlendMode( graphics.blendMode );

        for (let i = 0, n = webGL.data.length; i < n; i++)
        {
            webGLData = webGL.data[i];
            let shaderTemp = webGLData.shader;

            renderer.bindShader(shaderTemp);
            shaderTemp.uniforms.translationMatrix = graphics.transform.worldTransform.toArray(true);
            shaderTemp.uniforms.tint = utils.hex2rgb(graphics.tint);
            shaderTemp.uniforms.alpha = graphics.worldAlpha;

            webGLData.vao.bind()
            .draw(gl.TRIANGLE_STRIP,  webGLData.indices.length)
            .unbind();
        }
    }

    /**
     * Updates the graphics object
     *
     * @private
     * @param graphics {PIXI.Graphics} The graphics object to update
     */
    updateGraphics(graphics)
    {
        let gl = this.renderer.gl;

         // get the contexts graphics object
        let webGL = graphics._webGL[this.CONTEXT_UID];

        // if the graphics object does not exist in the webGL context time to create it!
        if (!webGL)
        {
            webGL = graphics._webGL[this.CONTEXT_UID] = {lastIndex:0, data:[], gl:gl, clearDirty:-1, dirty:-1};

        }

        // flag the graphics as not dirty as we are about to update it...
        webGL.dirty = graphics.dirty;

        let i;

        // if the user cleared the graphics object we will need to clear every object
        if (graphics.clearDirty !== webGL.clearDirty)
        {
            webGL.clearDirty = graphics.clearDirty;

            // loop through and return all the webGLDatas to the object pool so than can be reused later on
            for (i = 0; i < webGL.data.length; i++)
            {
                let graphicsData = webGL.data[i];
                this.graphicsDataPool.push( graphicsData );
            }

            // clear the array and reset the index..
            webGL.data = [];
            webGL.lastIndex = 0;
        }

        let webGLData;

        // loop through the graphics datas and construct each one..
        // if the object is a complex fill then the new stencil buffer technique will be used
        // other wise graphics objects will be pushed into a batch..
        for (i = webGL.lastIndex; i < graphics.graphicsData.length; i++)
        {
            let data = graphics.graphicsData[i];

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
    }

    /**
     *
     * @private
     * @param webGL {WebGLRenderingContext} the current WebGL drawing context
     * @param type {number} TODO @Alvin
     */
    getWebGLData(webGL, type)
    {
        let webGLData = webGL.data[webGL.data.length-1];

        if (!webGLData || webGLData.points.length > 320000)
        {
            webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(this.renderer.gl, this.primitiveShader, this.renderer.state.attribsState);
            webGLData.reset(type);
            webGL.data.push(webGLData);
        }

        webGLData.dirty = true;

        return webGLData;
    }
}

WebGLRenderer.registerPlugin('graphics', GraphicsRenderer);

export default GraphicsRenderer;