import type { ICanvas } from '../../environment/canvas/ICanvas';
import type { WebGLOptions, WebGLPipes, WebGLRenderer } from './gl/WebGLRenderer';
import type { WebGPUOptions, WebGPUPipes, WebGPURenderer } from './gpu/WebGPURenderer';

/** A generic renderer. */
export type Renderer<T extends ICanvas = HTMLCanvasElement> = WebGLRenderer<T> | WebGPURenderer<T>;
export type RenderPipes = WebGLPipes | WebGPUPipes;
export interface RendererOptions extends WebGLOptions, WebGPUOptions {}

/* eslint-disable @typescript-eslint/indent */
/**
 * Ids for the different render types.
 * The idea is that you can use bitwise operations to filter weather or not you want to do somthing in a certain render type.
 * Filters for example can be compatible for both webGL or WebGPU but not compatible with canvas.
 * So internally if it works with both we set filter.compatibleRenderers = RendererType.WEBGL | RendererType.WEBGPU
 * if it only works with webgl we set filter.compatibleRenderers = RendererType.WEBGL
 *
 */
export enum RendererType
{
    WEBGL = 0b1,
    WEBGPU = 0b10
}

export type GpuPowerPreference = 'low-power' | 'high-performance';
