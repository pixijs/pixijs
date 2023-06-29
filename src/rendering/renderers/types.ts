import type { WebGLOptions, WebGLRenderer, WebGLRenderPipes } from './gl/WebGLRenderer';
import type { WebGPUOptions, WebGPURenderer, WebGPURenderPipes } from './gpu/WebGPURenderer';

export type Renderer = WebGLRenderer | WebGPURenderer;
export type RenderPipes = WebGLRenderPipes | WebGPURenderPipes;
export type RendererOptions = WebGLOptions | WebGPUOptions;

