import { Color } from '../../../color/Color';
import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { mapCanvasBlendModesToPixi } from './utils/mapCanvasBlendModesToPixi';

import type { ICanvasRenderingContext2D } from '../../../environment/canvas/ICanvasRenderingContext2D';
import type { BLEND_MODES } from '../shared/state/const';
import type { System } from '../shared/system/System';
import type { CanvasRenderer } from './CanvasRenderer';

const tempMatrix = new Matrix();

/**
 * Canvas 2D context with vendor image smoothing flags.
 * @internal
 */
export interface CrossPlatformCanvasRenderingContext2D extends ICanvasRenderingContext2D
{
    /** WebKit-specific image smoothing flag. */
    webkitImageSmoothingEnabled: boolean;
    /** Mozilla-specific image smoothing flag. */
    mozImageSmoothingEnabled: boolean;
    /** Opera-specific image smoothing flag. */
    oImageSmoothingEnabled: boolean;
    /** Microsoft-specific image smoothing flag. */
    msImageSmoothingEnabled: boolean;
}

/**
 * Available image smoothing flags for the current context.
 * @internal
 */
export type SmoothingEnabledProperties =
    'imageSmoothingEnabled' |
    'webkitImageSmoothingEnabled' |
    'mozImageSmoothingEnabled' |
    'oImageSmoothingEnabled' |
    'msImageSmoothingEnabled';

/**
 * Canvas 2D context system for the CanvasRenderer.
 * @category rendering
 * @advanced
 */
export class CanvasContextSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasSystem,
        ],
        name: 'canvasContext',
    } as const;

    private readonly _renderer: CanvasRenderer;

    /** Root 2D context tied to the renderer's canvas. */
    public rootContext: CrossPlatformCanvasRenderingContext2D;
    /** Active 2D context for rendering (root or render target). */
    public activeContext: CrossPlatformCanvasRenderingContext2D;
    /** Resolution of the active context. */
    public activeResolution = 1;

    /** The image smoothing property to toggle for this browser. */
    public smoothProperty: SmoothingEnabledProperties = 'imageSmoothingEnabled';
    /** Map of Pixi blend modes to canvas composite operations. */
    public readonly blendModes = mapCanvasBlendModesToPixi();

    /** Current canvas blend mode. */
    public _activeBlendMode: BLEND_MODES = 'normal';
    /** Optional projection transform for render targets. */
    public _projTransform: Matrix = null;
    /** True when external blend mode control is in use. */
    public _outerBlend = false;
    /** Tracks unsupported blend mode warnings to avoid spam. */
    private readonly _warnedBlendModes = new Set<BLEND_MODES>();

    /**
     * @param renderer - The owning CanvasRenderer.
     */
    constructor(renderer: CanvasRenderer)
    {
        this._renderer = renderer;
    }

    protected resolutionChange(resolution: number): void
    {
        this.activeResolution = resolution;
    }

    /** Initializes the root context and smoothing flag selection. */
    public init(): void
    {
        const alpha = this._renderer.background.alpha < 1;

        this.rootContext = this._renderer.canvas.getContext(
            '2d',
            { alpha }
        ) as unknown as CrossPlatformCanvasRenderingContext2D;
        this.activeContext = this.rootContext;
        this.activeResolution = this._renderer.resolution;

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
     * Sets the current transform on the active context.
     * @param transform - Transform to apply.
     * @param roundPixels - Whether to round translation to integers.
     * @param localResolution - Optional local resolution multiplier.
     * @param skipGlobalTransform - If true, skip applying the global world transform matrix.
     */
    public setContextTransform(
        transform: Matrix,
        roundPixels?: boolean,
        localResolution?: number,
        skipGlobalTransform?: boolean
    ): void
    {
        const globalTransform = skipGlobalTransform
            ? Matrix.IDENTITY
            : (this._renderer.globalUniforms.globalUniformData?.worldTransformMatrix || Matrix.IDENTITY);

        let mat = tempMatrix;

        mat.copyFrom(globalTransform);
        mat.append(transform);

        const proj = this._projTransform;
        const contextResolution = this.activeResolution;

        localResolution = localResolution || contextResolution;

        if (proj)
        {
            const finalMat = Matrix.shared;

            finalMat.copyFrom(mat);
            finalMat.prepend(proj);
            mat = finalMat;
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
     * Clears the current render target, optionally filling with a color.
     * @param clearColor - Color to fill after clearing.
     * @param alpha - Alpha override for the clear color.
     */
    public clear(clearColor?: number[] | string | number, alpha?: number): void
    {
        const context = this.activeContext;
        const renderer = this._renderer;

        context.clearRect(0, 0, renderer.width, renderer.height);

        if (clearColor)
        {
            const color = Color.shared.setValue(clearColor);

            context.globalAlpha = alpha ?? color.alpha;
            context.fillStyle = color.toHex();
            context.fillRect(0, 0, renderer.width, renderer.height);
            context.globalAlpha = 1;
        }
    }

    /**
     * Sets the active blend mode.
     * @param blendMode - Pixi blend mode.
     */
    public setBlendMode(blendMode: BLEND_MODES): void
    {
        if (this._activeBlendMode === blendMode) return;

        this._activeBlendMode = blendMode;
        this._outerBlend = false;

        const mappedBlend = this.blendModes[blendMode];

        if (!mappedBlend)
        {
            if (!this._warnedBlendModes.has(blendMode))
            {
                console.warn(
                    `CanvasRenderer: blend mode "${blendMode}" is not supported in Canvas2D; falling back to "source-over".`
                );
                this._warnedBlendModes.add(blendMode);
            }

            this.activeContext.globalCompositeOperation = 'source-over';

            return;
        }

        this.activeContext.globalCompositeOperation = mappedBlend;
    }

    /** Releases context references. */
    public destroy(): void
    {
        this.rootContext = null;
        this.activeContext = null;
        this._warnedBlendModes.clear();
    }
}
