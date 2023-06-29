import type { WebGLOptions, WebGLPipes, WebGLRenderer } from './gl/WebGLRenderer';
import type { WebGPUOptions, WebGPUPipes, WebGPURenderer } from './gpu/WebGPURenderer';

export type Renderer = WebGLRenderer | WebGPURenderer;
export type RenderPipes = WebGLPipes | WebGPUPipes;
export type RendererOptions = WebGLOptions | WebGPUOptions;

