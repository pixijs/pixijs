import type { ICanvas } from '../../environment/canvas/ICanvas';
import type { WebGLOptions, WebGLPipes, WebGLRenderer } from './gl/WebGLRenderer';
import type { WebGPUOptions, WebGPUPipes, WebGPURenderer } from './gpu/WebGPURenderer';

/**
 * A generic renderer that can be either a WebGL or WebGPU renderer.
 * @category rendering
 * @extends WebGLRenderer
 * @extends WebGPURenderer
 * @standard
 */
export type Renderer<T extends ICanvas = HTMLCanvasElement> = WebGLRenderer<T> | WebGPURenderer<T>;
/**
 * Generic pipes for the renderer.
 * @category rendering
 * @advanced
 */
export type RenderPipes = WebGLPipes | WebGPUPipes;
/**
 * Options for the renderer.
 * @extends WebGLOptions
 * @extends WebGPUOptions
 * @category rendering
 * @standard
 */
export interface RendererOptions extends WebGLOptions, WebGPUOptions {}

/**
 * Ids for the different render types.
 * The idea is that you can use bitwise operations to filter whether or not you want to do something
 * in a certain render type.
 * Filters for example can be compatible for both webGL or WebGPU but not compatible with canvas.
 * So internally if it works with both we set filter.compatibleRenderers = RendererType.WEBGL | RendererType.WEBGPU
 * if it only works with webgl we set filter.compatibleRenderers = RendererType.WEBGL
 * @category rendering
 * @internal
 */
export enum RendererType
{
    /** The WebGL renderer */
    WEBGL = 0b01,
    /** The WebGPU renderer */
    WEBGPU = 0b10,
    /** Either WebGL or WebGPU renderer */
    BOTH = 0b11
}

/**
 * The GPU power preference for the WebGPU context.
 * This is an optional hint indicating what configuration of GPU is suitable for the WebGPU context,
 *
 * - `'high-performance'` will prioritize rendering performance over power consumption,
 * - `'low-power'` will prioritize power saving over rendering performance.
 * @category rendering
 * @advanced
 */
export type GpuPowerPreference = 'low-power' | 'high-performance';
