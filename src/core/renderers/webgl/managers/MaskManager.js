import WebGLManager from './WebGLManager';
import AlphaMaskFilter from '../filters/spriteMask/SpriteMaskFilter';

/**
 * @class
 * @extends PIXI.WebGLManager
 * @memberof PIXI
 */
export default class MaskManager extends WebGLManager
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
     */
    constructor(renderer)
    {
        super(renderer);

        // TODO - we don't need both!
        this.scissor = false;
        this.scissorData = null;
        this.scissorRenderTarget = null;

        this.enableScissor = true;

        this.alphaMaskPool = [];
        this.alphaMaskIndex = 0;

        // color mask mode
        this.scissorEmpty = false;
        this.colorMaskCounter = 0;
    }

    /**
     * Applies the Mask and adds it to the current filter stack.
     *
     * @param {PIXI.DisplayObject} target - Display Object to push the mask to
     * @param {PIXI.Sprite|PIXI.Graphics} maskData - The masking data.
     */
    pushMask(target, maskData)
    {
        // TODO the root check means scissor rect will not
        // be used on render textures more info here:
        // https://github.com/pixijs/pixi.js/pull/3545

        if (maskData.texture)
        {
            this.pushSpriteMask(target, maskData);
        }
        else if (this.enableScissor
            && !this.scissor
            && this.renderer._activeRenderTarget.root
            && !this.renderer.stencilManager.stencilMaskStack.length
            && maskData.isFastRect())
        {
            const matrix = maskData.worldTransform;

            let rot = Math.atan2(matrix.b, matrix.a);

            // use the nearest degree!
            rot = Math.round(rot * (180 / Math.PI));

            if (rot % 90)
            {
                this.pushStencilMask(maskData);
            }
            else
            {
                this.pushScissorMask(target, maskData);
            }
        }
        else
        {
            this.pushStencilMask(maskData);
        }
    }

    /**
     * Removes the last mask from the mask stack and doesn't return it.
     *
     * @param {PIXI.DisplayObject} target - Display Object to pop the mask from
     * @param {PIXI.Sprite|PIXI.Graphics} maskData - The masking data.
     */
    popMask(target, maskData)
    {
        if (maskData.texture)
        {
            this.popSpriteMask(target, maskData);
        }
        else if (this.enableScissor && !this.renderer.stencilManager.stencilMaskStack.length)
        {
            this.popScissorMask(target, maskData);
        }
        else
        {
            this.popStencilMask(target, maskData);
        }
    }

    /**
     * Applies the Mask and adds it to the current filter stack.
     *
     * @param {PIXI.RenderTarget} target - Display Object to push the sprite mask to
     * @param {PIXI.Sprite} maskData - Sprite to be used as the mask
     */
    pushSpriteMask(target, maskData)
    {
        let alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];

        if (!alphaMaskFilter)
        {
            alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new AlphaMaskFilter(maskData)];
        }

        alphaMaskFilter[0].resolution = this.renderer.resolution;
        alphaMaskFilter[0].maskSprite = maskData;

        const stashFilterArea = target.filterArea;

        target.filterArea = maskData.getBounds(true);
        this.renderer.filterManager.pushFilter(target, alphaMaskFilter);
        target.filterArea = stashFilterArea;

        this.alphaMaskIndex++;
    }

    /**
     * Removes the last filter from the filter stack and doesn't return it.
     *
     */
    popSpriteMask()
    {
        this.renderer.filterManager.popFilter();
        this.alphaMaskIndex--;
    }

    /**
     * Applies the Mask and adds it to the current filter stack.
     *
     * @param {PIXI.Sprite|PIXI.Graphics} maskData - The masking data.
     */
    pushStencilMask(maskData)
    {
        this.renderer.currentRenderer.stop();
        this.renderer.stencilManager.pushStencil(maskData);
    }

    /**
     * Removes the last filter from the filter stack and doesn't return it.
     *
     */
    popStencilMask()
    {
        this.renderer.currentRenderer.stop();
        this.renderer.stencilManager.popStencil();
    }

    /**
     *
     * @param {PIXI.DisplayObject} target - Display Object to push the mask to
     * @param {PIXI.Graphics} maskData - The masking data.
     */
    pushScissorMask(target, maskData)
    {
        maskData.renderable = true;

        const renderTarget = this.renderer._activeRenderTarget;

        const bounds = maskData.getBounds();

        bounds.fit(renderTarget.size);
        maskData.renderable = false;

        this.renderer.gl.enable(this.renderer.gl.SCISSOR_TEST);

        const resolution = this.renderer.resolution;

        const x = Math.floor(bounds.x * resolution);
        const y = Math.floor((renderTarget.root ? renderTarget.size.height - bounds.y - bounds.height
            : bounds.y) * resolution);
        const w = Math.floor(bounds.width * resolution);
        const h = Math.floor(bounds.height * resolution);

        if (w > 0 && h > 0)
        {
            this.renderer.gl.scissor(x, y, w, h);
        }
        else
        {
            this.pushEmptyColorMask();
            this.scissorEmpty = true;
        }

        this.scissorRenderTarget = renderTarget;
        this.scissorData = maskData;
        this.scissor = true;
    }

    /**
     *
     *
     */
    popScissorMask()
    {
        this.scissorRenderTarget = null;
        this.scissorData = null;
        this.scissor = false;

        // must be scissor!
        const gl = this.renderer.gl;

        if (this.scissorEmpty)
        {
            this.scissorEmpty = false;
            this.popEmptyColorMask();
        }
        gl.disable(gl.SCISSOR_TEST);
    }

    /**
     * stops rendering colors
     */
    pushEmptyColorMask()
    {
        if (this.colorMaskCounter === 0)
        {
            this.renderer.gl.colorMask(true, true, true, true);
        }
        this.colorMaskCounter++;
    }

    /**
     * starts rendering colors
     */
    popEmptyColorMask()
    {
        this.colorMaskCounter--;
        if (this.colorMaskCounter === 0)
        {
            this.renderer.gl.colorMask(false, false, false, false);
        }
    }
}
