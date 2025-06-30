import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { Texture } from './Texture';

/**
 * Data about the pixels of a texture.
 * This includes the pixel data as a Uint8ClampedArray, and the width and height of the texture.
 * @category rendering
 * @advanced
 */
export type GetPixelsOutput = {
    pixels: Uint8ClampedArray;
    width: number;
    height: number;
};

/** @internal */
export interface CanvasGenerator
{
    generateCanvas(texture: Texture): ICanvas;
    getPixels(texture: Texture): GetPixelsOutput;
}
