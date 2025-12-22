import { Color } from '../../../color/Color';
import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { mapCanvasBlendModesToPixi } from './utils/mapCanvasBlendModesToPixi';

import type { ICanvasRenderingContext2D } from '../../../environment/canvas/ICanvasRenderingContext2D';
import type { System } from '../shared/system/System';
import type { BLEND_MODES } from '../shared/state/const';
import type { CanvasRenderer } from './CanvasRenderer';

const tempMatrix = new Matrix();

export interface CrossPlatformCanvasRenderingContext2D extends ICanvasRenderingContext2D
{
    webkitImageSmoothingEnabled: boolean;
    mozImageSmoothingEnabled: boolean;
    oImageSmoothingEnabled: boolean;
    msImageSmoothingEnabled: boolean;
}

export type SmoothingEnabledProperties =
    'imageSmoothingEnabled' |
    'webkitImageSmoothingEnabled' |
    'mozImageSmoothingEnabled' |
    'oImageSmoothingEnabled' |
    'msImageSmoothingEnabled';

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

    public rootContext: CrossPlatformCanvasRenderingContext2D;
    public activeContext: CrossPlatformCanvasRenderingContext2D;
    public activeResolution = 1;

    public smoothProperty: SmoothingEnabledProperties = 'imageSmoothingEnabled';
    public readonly blendModes = mapCanvasBlendModesToPixi();

    public _activeBlendMode: BLEND_MODES = 'normal';
    public _projTransform: Matrix = null;
    public _outerBlend = false;

    constructor(renderer: CanvasRenderer)
    {
        this._renderer = renderer;
    }

    public init(): void
    {
        const alpha = this._renderer.background.alpha < 1;

        this.rootContext = this._renderer.canvas.getContext('2d', { alpha }) as unknown as CrossPlatformCanvasRenderingContext2D;
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

    public setContextTransform(transform: Matrix, roundPixels?: boolean, localResolution?: number): void
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

    public setBlendMode(blendMode: BLEND_MODES): void
    {
        if (this._activeBlendMode === blendMode) return;

        this._activeBlendMode = blendMode;
        this._outerBlend = false;

        this.activeContext.globalCompositeOperation = this.blendModes[blendMode] || 'source-over';
    }

    public destroy(): void
    {
        this.rootContext = null;
        this.activeContext = null;
    }
}
