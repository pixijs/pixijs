import WebGLSystem from './WebGLSystem';
import { Rectangle, Matrix } from '../../../math';

const tempRect = new Rectangle();

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */

export default class RenderTextureSystem extends WebGLSystem
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        this.clearColor = renderer._backgroundColorRgba;

        // TODO moe this property somewhere else!
        this.defaultMaskStack = [];
    }

    bind(renderTexture)
    {
        // TODO - do we want this??
        if(this.renderTexture === renderTexture)return;

        this.renderTexture = renderTexture;

        if(renderTexture)
        {
            this.renderer.framebuffer.bind(renderTexture.baseTexture.frameBuffer);
            this.renderer.projection.update(renderTexture.frame, renderTexture.frame, false);
            this.renderer.stencil.setMaskStack(renderTexture.baseTexture.stencilMaskStack);
        }
        else
        {
            this.renderer.framebuffer.bind(null);

            tempRect.width = this.renderer.width;
            tempRect.height = this.renderer.height;
            // TODO store this..
            this.renderer.projection.update(tempRect, tempRect, true);
            this.renderer.stencil.setMaskStack(this.defaultMaskStack);
        }

        const glShader = this.renderer.shader.getGLShader()

        if (glShader)
        {
         //   glShader.uniforms.projectionMatrix = this.renderer.projection.projectionMatrix.toArray(true);
        }
    }

    /**
     * Erases the render texture and fills the drawing area with a colour
     *
     * @param {number} [clearColor] - The colour
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    clear(clearColor)
    {
        if(this.renderTexture)
        {
            clearColor = clearColor || this.renderTexture.baseTexture.clearColor;
        }
        else
        {
            clearColor = clearColor || this.clearColor;
        }

        this.renderer.framebuffer.clear(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    }

    resize(screenWidth, screenHeight)
    {
        // resize the root only!
        this.bind(null)
    }
}
