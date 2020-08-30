import { BasePrepare } from '@pixi/prepare';
import type { CanvasRenderer } from '@pixi/canvas-renderer';

/**
 * The prepare manager provides functionality to upload content to the GPU.
 *
 * This cannot be done directly for Canvas like in WebGL, but the effect can be achieved by drawing
 * textures to an offline canvas. This draw call will force the texture to be moved onto the GPU.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.prepare`
 *
 * @class
 * @extends PIXI.BasePrepare
 * @memberof PIXI
 */
export declare class CanvasPrepare extends BasePrepare
{
    /** @internal */
    canvas: HTMLCanvasElement;
    /** @internal */
    ctx: CanvasRenderingContext2D;
    /**
     * @param {PIXI.CanvasRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer: CanvasRenderer);
    /**
     * Destroys the plugin, don't use after this.
     *
     */
    destroy(): void;
}

export { };
