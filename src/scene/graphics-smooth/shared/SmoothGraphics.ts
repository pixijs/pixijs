import { Graphics } from '../../graphics/shared/Graphics';
import { GraphicsContext } from '../../graphics/shared/GraphicsContext';
import '../init';

import type { GraphicsOptions } from '../../graphics/shared/Graphics';

/**
 * A {@link Graphics} that anti-aliases its edges in the shader, so shapes stay smooth
 * without MSAA (`antialias: true`), at any scale and resolution.
 *
 * It has the same drawing API as `Graphics`. A {@link GraphicsContext} can't be drawn by both
 * a `Graphics` and a `SmoothGraphics`: give one of them a `context.clone()`.
 * Every edge gets about one pixel of analytic coverage (HHAA, half-plane half-axis anti-aliasing),
 * computed from the geometry in render target pixels.
 *
 * Use it for vector art that is drawn with thin lines, scaled, or rendered without MSAA
 * (render textures, filters, WebGPU canvases created with `antialias: false`).
 * On the canvas renderer, it is drawn like a regular `Graphics`.
 * @example
 * ```ts
 * import { SmoothGraphics } from 'pixi.js';
 *
 * const graphics = new SmoothGraphics()
 *     .circle(100, 100, 50)
 *     .fill(0xde3249)
 *     .stroke({ width: 2, color: 0xffffff });
 *
 * app.stage.addChild(graphics);
 * ```
 * @category scene
 * @standard
 * @see {@link Graphics} for the drawing API
 * @see {@link DashLineShader} for dashed lines
 */
export class SmoothGraphics extends Graphics
{
    /** @internal */
    public override readonly renderPipeId: string = 'smoothGraphics';

    /**
     * @param options - Options for the SmoothGraphics, or a context to draw
     */
    constructor(options?: GraphicsOptions | GraphicsContext)
    {
        if (options instanceof GraphicsContext)
        {
            options = { context: options };
        }

        super({ label: 'SmoothGraphics', ...options });
    }

    /**
     * Creates a new SmoothGraphics with the same context.
     * @param deep - Whether to clone the context too, instead of sharing it
     * @returns A new SmoothGraphics
     */
    public override clone(deep = false): SmoothGraphics
    {
        if (deep)
        {
            return new SmoothGraphics(this.context.clone());
        }

        // the context is shared from now on, so this object must not destroy it with itself
        (this._ownedContext as null) = null;

        return new SmoothGraphics(this.context);
    }
}
