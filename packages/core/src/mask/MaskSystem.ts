import { MaskData } from './MaskData';
import { SpriteMaskFilter } from '../filters/spriteMask/SpriteMaskFilter';
import { MASK_TYPES } from '@pixi/constants';

import type { ISystem } from '../ISystem';
import type { IMaskTarget } from './MaskData';
import type { Renderer } from '../Renderer';

/**
 * System plugin to the renderer to manage masks.
 *
 * There are three built-in types of masking:
 * * **Scissor Masking**: Scissor masking discards pixels that are outside of a rectangle called the scissor box. It is
 *  the most performant as the scissor test is inexpensive. However, it can only be used when the mask is rectangular.
 * * **Stencil Masking**: Stencil masking discards pixels that don't overlap with the pixels rendered into the stencil
 *  buffer. It is the next fastest option as it does not require rendering into a separate framebuffer. However, it does
 *  cause the mask to be rendered **twice** for each masking operation; hence, minimize the rendering cost of your masks.
 * * **Sprite Mask Filtering**: Sprite mask filtering discards pixels based on the red channel of the sprite-mask's
 *  texture. (Generally, the masking texture is grayscale). Using advanced techniques, you might be able to embed this
 *  type of masking in a custom shader - and hence, bypassing the masking system fully for performance wins.
 *
 * The best type of masking is auto-detected when you `push` one. To use scissor masking, you must pass in a `Graphics`
 * object with just a rectangle drawn.
 *
 * ## Mask Stacks
 *
 * In the scene graph, masks can be applied recursively, i.e. a mask can be applied during a masking operation. The mask
 * stack stores the currently applied masks in order. Each {@link PIXI.BaseRenderTexture} holds its own mask stack, i.e.
 * when you switch render-textures, the old masks only applied when you switch back to rendering to the old render-target.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI
 */
export class MaskSystem implements ISystem
{
    public enableScissor: boolean;
    protected readonly alphaMaskPool: Array<SpriteMaskFilter[]>;
    protected alphaMaskIndex: number;
    private readonly maskDataPool: Array<MaskData>;
    private maskStack: Array<MaskData>;
    private renderer: Renderer;

    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        /**
         * Enable scissor masking.
         *
         * @member {boolean}
         * @readonly
         */
        this.enableScissor = true;

        /**
         * Pool of used sprite mask filters
         * @member {PIXI.SpriteMaskFilter[]}
         * @readonly
         */
        this.alphaMaskPool = [];

        /**
         * Pool of mask data
         * @member {PIXI.MaskData[]}
         * @readonly
         */
        this.maskDataPool = [];

        this.maskStack = [];

        /**
         * Current index of alpha mask pool
         * @member {number}
         * @default 0
         * @readonly
         */
        this.alphaMaskIndex = 0;
    }

    /**
     * Changes the mask stack that is used by this System.
     *
     * @param {PIXI.MaskData[]} maskStack - The mask stack
     */
    setMaskStack(maskStack: Array<MaskData>): void
    {
        this.maskStack = maskStack;
        this.renderer.scissor.setMaskStack(maskStack);
        this.renderer.stencil.setMaskStack(maskStack);
    }

    /**
     * Enables the mask and appends it to the current mask stack.
     *
     * NOTE: The batch renderer should be flushed beforehand to prevent pending renders from being masked.
     *
     * @param {PIXI.DisplayObject} target - Display Object to push the mask to
     * @param {PIXI.MaskData|PIXI.Sprite|PIXI.Graphics|PIXI.DisplayObject} maskData - The masking data.
     */
    push(target: IMaskTarget, maskDataOrTarget: MaskData|IMaskTarget): void
    {
        let maskData = maskDataOrTarget as MaskData;

        if (!maskData.isMaskData)
        {
            const d = this.maskDataPool.pop() || new MaskData();

            d.pooled = true;
            d.maskObject = maskDataOrTarget as IMaskTarget;
            maskData = d;
        }

        if (maskData.autoDetect)
        {
            this.detect(maskData);
        }

        maskData.copyCountersOrReset(this.maskStack[this.maskStack.length - 1]);
        maskData._target = target;

        switch (maskData.type)
        {
            case MASK_TYPES.SCISSOR:
                this.maskStack.push(maskData);
                this.renderer.scissor.push(maskData);
                break;
            case MASK_TYPES.STENCIL:
                this.maskStack.push(maskData);
                this.renderer.stencil.push(maskData);
                break;
            case MASK_TYPES.SPRITE:
                maskData.copyCountersOrReset(null);
                this.pushSpriteMask(maskData);
                this.maskStack.push(maskData);
                break;
            default:
                break;
        }
    }

    /**
     * Removes the last mask from the mask stack and doesn't return it.
     *
     * NOTE: The batch renderer should be flushed beforehand to render the masked contents before the mask is removed.
     *
     * @param {PIXI.DisplayObject} target - Display Object to pop the mask from
     */
    pop(target: IMaskTarget): void
    {
        const maskData = this.maskStack.pop();

        if (!maskData || maskData._target !== target)
        {
            // TODO: add an assert when we have it

            return;
        }

        switch (maskData.type)
        {
            case MASK_TYPES.SCISSOR:
                this.renderer.scissor.pop();
                break;
            case MASK_TYPES.STENCIL:
                this.renderer.stencil.pop(maskData.maskObject);
                break;
            case MASK_TYPES.SPRITE:
                this.popSpriteMask();
                break;
            default:
                break;
        }

        maskData.reset();

        if (maskData.pooled)
        {
            this.maskDataPool.push(maskData);
        }
    }

    /**
     * Sets type of MaskData based on its maskObject
     * @param {PIXI.MaskData} maskData
     */
    detect(maskData: MaskData): void
    {
        const maskObject = maskData.maskObject;

        if (maskObject.isSprite)
        {
            maskData.type = MASK_TYPES.SPRITE;

            return;
        }
        maskData.type = MASK_TYPES.STENCIL;
        // detect scissor in graphics
        if (this.enableScissor
            && maskObject.isFastRect
            && maskObject.isFastRect())
        {
            const matrix = maskObject.worldTransform;

            // TODO: move the check to the matrix itself
            // we are checking that its orthogonal and x rotation is 0 90 180 or 270

            let rotX = Math.atan2(matrix.b, matrix.a);
            let rotXY = Math.atan2(matrix.d, matrix.c);

            // use the nearest degree to 0.01
            rotX = Math.round(rotX * (180 / Math.PI) * 100);
            rotXY = Math.round(rotXY * (180 / Math.PI) * 100) - rotX;

            rotX = ((rotX % 9000) + 9000) % 9000;
            rotXY = ((rotXY % 18000) + 18000) % 18000;

            if (rotX === 0 && rotXY === 9000)
            {
                maskData.type = MASK_TYPES.SCISSOR;
            }
        }
    }

    /**
     * Applies the Mask and adds it to the current filter stack.
     *
     * @param {PIXI.MaskData} maskData - Sprite to be used as the mask
     */
    pushSpriteMask(maskData: MaskData): void
    {
        const { maskObject } = maskData;
        const target = maskData._target;
        let alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];

        if (!alphaMaskFilter)
        {
            alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new SpriteMaskFilter(maskObject)];
        }

        const renderer = this.renderer;
        const renderTextureSystem = renderer.renderTexture;

        let resolution;
        let multisample;

        if (renderTextureSystem.current)
        {
            const renderTexture = renderTextureSystem.current;

            resolution = maskData.resolution || renderTexture.resolution;
            multisample = maskData.multisample ?? renderTexture.multisample;
        }
        else
        {
            resolution = maskData.resolution || renderer.resolution;
            multisample = maskData.multisample ?? renderer.multisample;
        }

        alphaMaskFilter[0].resolution = resolution;
        alphaMaskFilter[0].multisample = multisample;
        alphaMaskFilter[0].maskSprite = maskObject;

        const stashFilterArea = target.filterArea;

        target.filterArea = maskObject.getBounds(true);
        renderer.filter.push(target, alphaMaskFilter);
        target.filterArea = stashFilterArea;

        this.alphaMaskIndex++;
    }

    /**
     * Removes the last filter from the filter stack and doesn't return it.
     */
    popSpriteMask(): void
    {
        this.renderer.filter.pop();
        this.alphaMaskIndex--;
    }

    /**
     * @ignore
     */
    destroy(): void
    {
        this.renderer = null;
    }
}
