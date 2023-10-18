import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { Texture } from './Texture';

export type GetPixelsOutput = {
    pixels: Uint8ClampedArray;
    width: number;
    height: number;
};

export interface CanvasGenerator
{
    generateCanvas(texture: Texture): ICanvas;
    getPixels(texture: Texture): GetPixelsOutput;
}
