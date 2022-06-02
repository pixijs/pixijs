import { Matrix } from '@pixi/math';

import type { CanvasRenderer } from './CanvasRenderer';
import type { ISystem } from '@pixi/core';
import { mapCanvasBlendModesToPixi } from './utils/mapCanvasBlendModesToPixi';
import { BLEND_MODES, SCALE_MODES } from '@pixi/constants';
import { settings } from '@pixi/settings';

const tempMatrix = new Matrix();

/**
 * Rendering context for all browsers. This includes platform-specific
 * properties that are not included in the spec for CanvasRenderingContext2D
 * @private
 */
export interface CrossPlatformCanvasRenderingContext2D extends CanvasRenderingContext2D
{
    webkitImageSmoothingEnabled: boolean;
    mozImageSmoothingEnabled: boolean;
    oImageSmoothingEnabled: boolean;
    msImageSmoothingEnabled: boolean;
}

/*
 * Different browsers support different smoothing property names
 * this is the list of all platform props.
 */
export type SmoothingEnabledProperties =
    'imageSmoothingEnabled' |
    'webkitImageSmoothingEnabled' |
    'mozImageSmoothingEnabled' |
    'oImageSmoothingEnabled' |
    'msImageSmoothingEnabled';

/**
 * System that manages the canvas `2d` contexts
 * @memberof PIXI
 */
export class CanvasContextSystem implements ISystem
{
    /** A reference to the current renderer */
    private renderer: CanvasRenderer;

    /** The root canvas 2d context that everything is drawn with. */
    public rootContext: CrossPlatformCanvasRenderingContext2D;
    /** The currently active canvas 2d context (could change with renderTextures) */
    public activeContext: CrossPlatformCanvasRenderingContext2D;
    public activeResolution = 1;

    /** The canvas property used to set the canvas smoothing property. */
    public smoothProperty: SmoothingEnabledProperties = 'imageSmoothingEnabled';
    /** Tracks the blend modes useful for this renderer. */
    public readonly blendModes: string[] = mapCanvasBlendModesToPixi();

    _activeBlendMode: BLEND_MODES = null;
    /** Projection transform, passed in render() stored here */
    _projTransform: Matrix = null;

    /** @private */
    _outerBlend = false;

    /** @param renderer - A reference to the current renderer */
    constructor(renderer: CanvasRenderer)
    {
        this.renderer = renderer;
    }

    /** initiates the system */
    init(): void
    {
        const alpha = this.renderer.background.alpha < 1;

        this.rootContext = this.renderer.view.getContext('2d', { alpha }) as
        CrossPlatformCanvasRenderingContext2D;

        this.activeContext = this.rootContext;

        if (!this.rootContext.imageSmoothingEnabled)
        {
            const rc = this.rootContext;

            if (rc.webkitImageSmoothingEnabled)
            {
                this.smoothProperty = 'webkitImageSmoothingEnabled';
            }
            else if (rc.mozImageSmoothingEnabled)
            {
                this.smoothProperty = 'mozImageSmoothingEnabled';
            }
            else if (rc.oImageSmoothingEnabled)
            {
                this.smoothProperty = 'oImageSmoothingEnabled';
            }
            else if (rc.msImageSmoothingEnabled)
            {
                this.smoothProperty = 'msImageSmoothingEnabled';
            }
        }
    }

    /**
     * Sets matrix of context.
     * called only from render() methods
     * takes care about resolution
     * @param transform - world matrix of current element
     * @param roundPixels - whether to round (tx,ty) coords
     * @param localResolution - If specified, used instead of `renderer.resolution` for local scaling
     */
    setContextTransform(transform: Matrix, roundPixels?: boolean, localResolution?: number): void
    {
        let mat = transform;
        const proj = this._projTransform;
        const contextResolution = this.activeResolution;

        localResolution = localResolution || contextResolution;

        if (proj)
        {
            mat = tempMatrix;
            mat.copyFrom(transform);
            mat.prepend(proj);
        }

        if (roundPixels)
        {
            this.activeContext.setTransform(
                mat.a * localResolution,
                mat.b * localResolution,
                mat.c * localResolution,
                mat.d * localResolution,
                (mat.tx * contextResolution) | 0,
                (mat.ty * contextResolution) | 0
            );
        }
        else
        {
            this.activeContext.setTransform(
                mat.a * localResolution,
                mat.b * localResolution,
                mat.c * localResolution,
                mat.d * localResolution,
                mat.tx * contextResolution,
                mat.ty * contextResolution
            );
        }
    }

    /**
     * Clear the canvas of renderer.
     * @param {string} [clearColor] - Clear the canvas with this color, except the canvas is transparent.
     * @param {number} [alpha] - Alpha to apply to the background fill color.
     */
    public clear(clearColor?: string, alpha?: number): void
    {
        const { activeContext: context, renderer } = this;

        clearColor = clearColor ?? this.renderer.background.colorString;

        context.clearRect(0, 0, renderer.width, renderer.height);

        if (clearColor)
        {
            context.globalAlpha = alpha ?? this.renderer.background.alpha;
            context.fillStyle = clearColor;
            context.fillRect(0, 0, renderer.width, renderer.height);
            context.globalAlpha = 1;
        }
    }

    /**
     * Sets the blend mode of the renderer.
     * @param {number} blendMode - See {@link PIXI.BLEND_MODES} for valid values.
     * @param {boolean} [readyForOuterBlend=false] - Some blendModes are dangerous, they affect outer space of sprite.
     * Pass `true` only if you are ready to use them.
     */
    setBlendMode(blendMode: BLEND_MODES, readyForOuterBlend?: boolean): void
    {
        const outerBlend = blendMode === BLEND_MODES.SRC_IN
                 || blendMode === BLEND_MODES.SRC_OUT
                 || blendMode === BLEND_MODES.DST_IN
                 || blendMode === BLEND_MODES.DST_ATOP;

        if (!readyForOuterBlend && outerBlend)
        {
            blendMode = BLEND_MODES.NORMAL;
        }

        if (this._activeBlendMode === blendMode)
        {
            return;
        }

        this._activeBlendMode = blendMode;
        this._outerBlend = outerBlend;
        this.activeContext.globalCompositeOperation = this.blendModes[blendMode];
    }

    resize(): void
    {
        // reset the scale mode.. oddly this seems to be reset when the canvas is resized.
        // surely a browser bug?? Let PixiJS fix that for you..
        if (this.smoothProperty)
        {
            this.rootContext[this.smoothProperty] = (settings.SCALE_MODE === SCALE_MODES.LINEAR);
        }
    }

    /** Checks if blend mode has changed. */
    invalidateBlendMode(): void
    {
        this._activeBlendMode = this.blendModes.indexOf(this.activeContext.globalCompositeOperation);
    }

    public destroy(): void
    {
        this.renderer = null;
        this.rootContext = null;

        this.activeContext = null;
        this.smoothProperty = null;
    }
}
