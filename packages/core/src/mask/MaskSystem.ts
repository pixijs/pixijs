import { MaskData } from './MaskData';
import { SpriteMaskFilter } from '../filters/spriteMask/SpriteMaskFilter';
import { MASK_TYPES } from '@pixi/constants';

import type { ISystem } from '../system/ISystem';
import type { IMaskTarget } from './MaskData';
import type { Renderer } from '../Renderer';
import type { ExtensionMetadata } from '@pixi/extensions';
import { extensions, ExtensionType } from '@pixi/extensions';

/**
 * System plugin to the renderer to manage masks.
 *
 * There are three built-in types of masking:
 * **Scissor Masking**: Scissor masking discards pixels that are outside of a rectangle called the scissor box. It is
 *  the most performant as the scissor test is inexpensive. However, it can only be used when the mask is rectangular.
 * **Stencil Masking**: Stencil masking discards pixels that don't overlap with the pixels rendered into the stencil
 *  buffer. It is the next fastest option as it does not require rendering into a separate framebuffer. However, it does
 *  cause the mask to be rendered **twice** for each masking operation; hence, minimize the rendering cost of your masks.
 * **Sprite Mask Filtering**: Sprite mask filtering discards pixels based on the red channel of the sprite-mask's
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
 * @memberof PIXI
 */
export class MaskSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: ExtensionType.RendererSystem,
        name: 'mask',
    };

    /**
     * Flag to enable scissor masking.
     * @default true
     */
    public enableScissor: boolean;

    /** Pool of used sprite mask filters. */
    protected readonly alphaMaskPool: Array<SpriteMaskFilter[]>;

    /**
     * Current index of alpha mask pool.
     * @default 0
     * @readonly
     */
    protected alphaMaskIndex: number;

    /** Pool of mask data. */
    private readonly maskDataPool: Array<MaskData>;
    private maskStack: Array<MaskData>;
    private renderer: Renderer;

    /**
     * @param renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        this.enableScissor = true;
        this.alphaMaskPool = [];
        this.maskDataPool = [];

        this.maskStack = [];
        this.alphaMaskIndex = 0;
    }

    /**
     * Changes the mask stack that is used by this System.
     * @param maskStack - The mask stack
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
     * @param {PIXI.DisplayObject} target - Display Object to push the mask to
     * @param {PIXI.MaskData|PIXI.Sprite|PIXI.Graphics|PIXI.DisplayObject} maskDataOrTarget - The masking data.
     */
    push(target: IMaskTarget, maskDataOrTarget: MaskData | IMaskTarget): void
    {
        let maskData = maskDataOrTarget as MaskData;

        if (!maskData.isMaskData)
        {
            const d = this.maskDataPool.pop() || new MaskData();

            d.pooled = true;
            d.maskObject = maskDataOrTarget as IMaskTarget;
            maskData = d;
        }

        const maskAbove = this.maskStack.length !== 0 ? this.maskStack[this.maskStack.length - 1] : null;

        maskData.copyCountersOrReset(maskAbove);
        maskData._colorMask = maskAbove ? maskAbove._colorMask : 0xf;

        if (maskData.autoDetect)
        {
            this.detect(maskData);
        }

        maskData._target = target;

        if (maskData.type !== MASK_TYPES.SPRITE)
        {
            this.maskStack.push(maskData);
        }

        if (maskData.enabled)
        {
            switch (maskData.type)
            {
                case MASK_TYPES.SCISSOR:
                    this.renderer.scissor.push(maskData);
                    break;
                case MASK_TYPES.STENCIL:
                    this.renderer.stencil.push(maskData);
                    break;
                case MASK_TYPES.SPRITE:
                    maskData.copyCountersOrReset(null);
                    this.pushSpriteMask(maskData);
                    break;
                case MASK_TYPES.COLOR:
                    this.pushColorMask(maskData);
                    break;
                default:
                    break;
            }
        }

        if (maskData.type === MASK_TYPES.SPRITE)
        {
            this.maskStack.push(maskData);
        }
    }

    /**
     * Removes the last mask from the mask stack and doesn't return it.
     *
     * NOTE: The batch renderer should be flushed beforehand to render the masked contents before the mask is removed.
     * @param {PIXI.IMaskTarget} target - Display Object to pop the mask from
     */
    pop(target: IMaskTarget): void
    {
        const maskData = this.maskStack.pop();

        if (!maskData || maskData._target !== target)
        {
            // TODO: add an assert when we have it

            return;
        }

        if (maskData.enabled)
        {
            switch (maskData.type)
            {
                case MASK_TYPES.SCISSOR:
                    this.renderer.scissor.pop(maskData);
                    break;
                case MASK_TYPES.STENCIL:
                    this.renderer.stencil.pop(maskData.maskObject);
                    break;
                case MASK_TYPES.SPRITE:
                    this.popSpriteMask(maskData);
                    break;
                case MASK_TYPES.COLOR:
                    this.popColorMask(maskData);
                    break;
                default:
                    break;
            }
        }

        maskData.reset();

        if (maskData.pooled)
        {
            this.maskDataPool.push(maskData);
        }

        if (this.maskStack.length !== 0)
        {
            const maskCurrent = this.maskStack[this.maskStack.length - 1];

            if (maskCurrent.type === MASK_TYPES.SPRITE && maskCurrent._filters)
            {
                maskCurrent._filters[0].maskSprite = maskCurrent.maskObject;
            }
        }
    }

    /**
     * Sets type of MaskData based on its maskObject.
     * @param maskData
     */
    detect(maskData: MaskData): void
    {
        const maskObject = maskData.maskObject;

        if (!maskObject)
        {
            maskData.type = MASK_TYPES.COLOR;
        }
        else if (maskObject.isSprite)
        {
            maskData.type = MASK_TYPES.SPRITE;
        }
        else if (this.enableScissor && this.renderer.scissor.testScissor(maskData))
        {
            maskData.type = MASK_TYPES.SCISSOR;
        }
        else
        {
            maskData.type = MASK_TYPES.STENCIL;
        }
    }

    /**
     * Applies the Mask and adds it to the current filter stack.
     * @param maskData - Sprite to be used as the mask.
     */
    pushSpriteMask(maskData: MaskData): void
    {
        const { maskObject } = maskData;
        const target = maskData._target;
        let alphaMaskFilter = maskData._filters;

        if (!alphaMaskFilter)
        {
            alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];

            if (!alphaMaskFilter)
            {
                alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new SpriteMaskFilter()];
            }
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

        if (!maskData._filters)
        {
            this.alphaMaskIndex++;
        }
    }

    /**
     * Removes the last filter from the filter stack and doesn't return it.
     * @param maskData - Sprite to be used as the mask.
     */
    popSpriteMask(maskData: MaskData): void
    {
        this.renderer.filter.pop();

        if (maskData._filters)
        {
            maskData._filters[0].maskSprite = null;
        }
        else
        {
            this.alphaMaskIndex--;
            this.alphaMaskPool[this.alphaMaskIndex][0].maskSprite = null;
        }
    }

    /**
     * Pushes the color mask.
     * @param maskData - The mask data
     */
    pushColorMask(maskData: MaskData): void
    {
        const currColorMask = maskData._colorMask;
        const nextColorMask = maskData._colorMask = currColorMask & maskData.colorMask;

        if (nextColorMask !== currColorMask)
        {
            this.renderer.gl.colorMask(
                (nextColorMask & 0x1) !== 0,
                (nextColorMask & 0x2) !== 0,
                (nextColorMask & 0x4) !== 0,
                (nextColorMask & 0x8) !== 0
            );
        }
    }

    /**
     * Pops the color mask.
     * @param maskData - The mask data
     */
    popColorMask(maskData: MaskData): void
    {
        const currColorMask = maskData._colorMask;
        const nextColorMask = this.maskStack.length > 0
            ? this.maskStack[this.maskStack.length - 1]._colorMask : 0xf;

        if (nextColorMask !== currColorMask)
        {
            this.renderer.gl.colorMask(
                (nextColorMask & 0x1) !== 0,
                (nextColorMask & 0x2) !== 0,
                (nextColorMask & 0x4) !== 0,
                (nextColorMask & 0x8) !== 0
            );
        }
    }

    destroy(): void
    {
        this.renderer = null;
    }
}

extensions.add(MaskSystem);
