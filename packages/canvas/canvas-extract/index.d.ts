import { CanvasRenderer } from '@pixi/canvas-renderer';
import type { DisplayObject } from '@pixi/display';
import { RenderTexture } from '@pixi/core';

/**
 * The extract manager provides functionality to export content from the renderers.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.extract`
 *
 * @class
 * @memberof PIXI
 */
export declare class CanvasExtract
{
    renderer: CanvasRenderer;
    /**
     * @param {PIXI.CanvasRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer: CanvasRenderer);
    /**
     * Will return a HTML Image of the target
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param {string} [format] - Image format, e.g. "image/jpeg" or "image/webp".
     * @param {number} [quality] - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @return {HTMLImageElement} HTML Image of the target
     */
    image(target: DisplayObject | RenderTexture, format?: string, quality?: number): HTMLImageElement;
    /**
     * Will return a a base64 encoded string of this target. It works by calling
     *  `CanvasExtract.getCanvas` and then running toDataURL on that.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param {string} [format] - Image format, e.g. "image/jpeg" or "image/webp".
     * @param {number} [quality] - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @return {string} A base64 encoded string of the texture.
     */
    base64(target: DisplayObject | RenderTexture, format?: string, quality?: number): string;
    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
     */
    canvas(target: DisplayObject | RenderTexture): HTMLCanvasElement;
    /**
     * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
     * order, with integer values between 0 and 255 (included).
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @return {Uint8ClampedArray} One-dimensional array containing the pixel data of the entire texture
     */
    pixels(target: DisplayObject | RenderTexture): Uint8ClampedArray;
    /**
     * Destroys the extract
     *
     */
    destroy(): void;
}

export { };
