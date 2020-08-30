import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { Graphics } from '@pixi/graphics';
import { Matrix } from '@pixi/math';

/**
 * Renderer dedicated to drawing and batching graphics objects.
 *
 * @class
 * @protected
 * @memberof PIXI
 */
export declare class CanvasGraphicsRenderer {
    renderer: CanvasRenderer;
    private _svgMatrix;
    private _tempMatrix;
    /**
     * @param {PIXI.CanvasRenderer} renderer - The current PIXI renderer.
     */
    constructor(renderer: CanvasRenderer);
    /**
     * calculates fill/stroke style for canvas
     *
     * @private
     * @param {PIXI.FillStyle} style
     * @param {number} tint
     * @returns {string|CanvasPattern}
     */
    private _calcCanvasStyle;
    /**
     * Renders a Graphics object to a canvas.
     *
     * @param {PIXI.Graphics} graphics - the actual graphics object to render
     */
    render(graphics: Graphics): void;
    setPatternTransform(pattern: CanvasPattern, matrix: Matrix): void;
    /**
     * destroy graphics object
     *
     */
    destroy(): void;
}

export { }
