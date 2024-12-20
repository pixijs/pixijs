import type { ICanvas } from '../../environment/canvas/ICanvas';
import type { WebGLOptions, WebGLPipes, WebGLRenderer } from './gl/WebGLRenderer';
import type { WebGPUOptions, WebGPUPipes, WebGPURenderer } from './gpu/WebGPURenderer';

/** A generic renderer. */
/**
 * @memberof rendering
 * @extends rendering.WebGLRenderer
 * @extends rendering.WebGPURenderer
 */
export type Renderer<T extends ICanvas = HTMLCanvasElement> = WebGLRenderer<T> | WebGPURenderer<T>;
export type RenderPipes = WebGLPipes | WebGPUPipes;
/**
 * @extends rendering.WebGLOptions
 * @extends rendering.WebGPUOptions
 */
export interface RendererOptions extends WebGLOptions, WebGPUOptions {}

/**
 * Ids for the different render types.
 * The idea is that you can use bitwise operations to filter whether or not you want to do something
 * in a certain render type.
 * Filters for example can be compatible for both webGL or WebGPU but not compatible with canvas.
 * So internally if it works with both we set filter.compatibleRenderers = RendererType.WEBGL | RendererType.WEBGPU
 * if it only works with webgl we set filter.compatibleRenderers = RendererType.WEBGL
 *
 */
export enum RendererType
{
    WEBGL = 0b01,
    WEBGPU = 0b10,
    BOTH = 0b11
}

export type GpuPowerPreference = 'low-power' | 'high-performance';
