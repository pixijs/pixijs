import { warn } from '../../../utils/logging/warn';
import { FillGradient } from '../../graphics/shared/fill/FillGradient';
import { FillPattern } from '../../graphics/shared/fill/FillPattern';
import { Graphics, type GraphicsOptions } from '../../graphics/shared/Graphics';
import { GraphicsContext } from '../../graphics/shared/GraphicsContext';
import '../init';

import type { ColorSource } from '../../../color/Color';
import type { FillInput, FillStyle } from '../../graphics/shared/FillTypes';

/**
 * A display object that renders vector graphics using shader-based HHAA
 * (Half-plane, Half-axis Anti-Aliasing) for smooth, resolution-independent edges.
 *
 * Uses the same GraphicsContext API as standard Graphics but routes rendering
 * through the SmoothBatcher with a custom HHAA shader.
 *
 * Unsupported features (will warn in debug builds):
 * - FillGradient and FillPattern fills (solid color and texture fills work)
 * - Canvas renderer (WebGL/WebGPU only)
 * @category scene
 * @advanced
 */
export class SmoothGraphics extends Graphics
{
    /** @internal */
    public override readonly renderPipeId: string = 'smoothGraphics';

    /**
     * Creates a new SmoothGraphics object.
     * @param options - Options for the SmoothGraphics.
     */
    constructor(options?: GraphicsOptions | GraphicsContext)
    {
        if (options instanceof GraphicsContext)
        {
            options = { context: options };
        }

        super({ ...options, label: 'SmoothGraphics' });
    }

    public override fill(style?: FillInput): this;
    /** @deprecated 8.0.0 */
    public override fill(color: ColorSource, alpha?: number): this;
    public override fill(...args: [FillStyle | ColorSource, number?]): this
    {
        // #if _DEBUG
        this._warnUnsupportedFill(args[0]);
        // #endif

        return super.fill(args[0] as ColorSource, args[1]);
    }

    /**
     * Creates a clone of this SmoothGraphics.
     * @param deep - If true, clones the context; if false, shares it
     * @returns A new SmoothGraphics instance
     */
    public override clone(deep = false): SmoothGraphics
    {
        if (deep)
        {
            return new SmoothGraphics(this.context.clone());
        }

        (this._ownedContext as null) = null;

        return new SmoothGraphics(this.context);
    }

    /**
     * @param style
     * @internal
     */
    private _warnUnsupportedFill(style: FillStyle | ColorSource | undefined): void
    {
        if (style instanceof FillGradient || style instanceof FillPattern)
        {
            warn('[SmoothGraphics] gradient and pattern fills are not supported, use solid color or texture fills');
        }
        else if (style && typeof style === 'object' && 'fill' in style)
        {
            if (style.fill instanceof FillGradient || style.fill instanceof FillPattern)
            {
                warn('[SmoothGraphics] gradient and pattern fills are not supported, use solid color or texture fills');
            }
        }
    }
}
