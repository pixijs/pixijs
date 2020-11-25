import { AbstractMaskSystem } from './AbstractMaskSystem';

import type { Renderer } from '../Renderer';
import type { MaskData } from './MaskData';

/**
 * System plugin to the renderer to manage scissor masking.
 *
 * Scissor masking discards pixels outside of a rectangle called the scissor box. The scissor box is in the framebuffer
 * viewport's space; however, the mask's rectangle is projected from world-space to viewport space automatically
 * by this system.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI
 */
export class ScissorSystem extends AbstractMaskSystem
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        this.glConst = WebGLRenderingContext.SCISSOR_TEST;
    }

    getStackLength(): number
    {
        const maskData = this.maskStack[this.maskStack.length - 1];

        if (maskData)
        {
            return maskData._scissorCounter;
        }

        return 0;
    }

    /**
     * Applies the Mask and adds it to the current stencil stack.
     *
     * @author alvin
     * @param {PIXI.MaskData} maskData - The mask data
     */
    push(maskData: MaskData): void
    {
        const maskObject = maskData.maskObject;

        maskObject.renderable = true;

        const prevData = maskData._scissorRect;
        const bounds = maskObject.getBounds(true);
        const { gl } = this.renderer;

        maskObject.renderable = false;

        if (prevData)
        {
            bounds.fit(prevData);
        }
        else
        {
            gl.enable(gl.SCISSOR_TEST);
        }

        maskData._scissorCounter++;
        maskData._scissorRect = bounds;
        this._useCurrent();
    }

    /**
     * This should be called after a mask is popped off the mask stack. It will rebind the scissor box to be latest with the
     * last mask in the stack.
     *
     * This can also be called when you directly modify the scissor box and want to restore PixiJS state.
     */
    pop(): void
    {
        const { gl } = this.renderer;

        if (this.getStackLength() > 0)
        {
            this._useCurrent();
        }
        else
        {
            gl.disable(gl.SCISSOR_TEST);
        }
    }

    /**
     * Setup renderer to use the current scissor data.
     * @private
     */
    _useCurrent(): void
    {
        const rect = this.maskStack[this.maskStack.length - 1]._scissorRect;
        const rt = this.renderer.renderTexture.current;
        const { transform, sourceFrame, destinationFrame } = this.renderer.projection;
        const resolution = rt ? rt.resolution : this.renderer.resolution;
        const sx = destinationFrame.width / sourceFrame.width;
        const sy = destinationFrame.height / sourceFrame.height;

        let x = (((rect.x - sourceFrame.x) * sx) + destinationFrame.x) * resolution;
        let y = (((rect.y - sourceFrame.y) * sy) + destinationFrame.y) * resolution;
        const width = rect.width * sx * resolution;
        const height = rect.height * sy * resolution;

        if (transform)
        {
            x += transform.tx * resolution;
            y += transform.ty * resolution;
        }
        if (!rt)
        {
            // flipY. In future we'll have it over renderTextures as an option
            y = this.renderer.height - height - y;
        }

        this.renderer.gl.scissor(x, y, width, height);
    }
}
