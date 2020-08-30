import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { Sprite } from '@pixi/sprite';

/**
 * Types that can be passed to drawImage
 * @typedef {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap} ICanvasImageSource
 * @memberof PIXI
 */
/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * @class
 * @protected
 * @memberof PIXI
 */
export declare class CanvasSpriteRenderer
{
    protected renderer: CanvasRenderer;
    /**
     * @param {PIXI.Renderer} renderer -The renderer sprite this batch works for.
     */
    constructor(renderer: CanvasRenderer);
    /**
     * Renders the sprite object.
     *
     * @param {PIXI.Sprite} sprite - the sprite to render when using this spritebatch
     */
    render(sprite: Sprite): void;
    /**
     * destroy the sprite object.
     *
     */
    destroy(): void;
}

export { };
