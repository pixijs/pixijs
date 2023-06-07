import type { WebGLRenderer } from './gl/WebGLRenderer';
import type { WebGPURenderer } from './gpu/WebGPURenderer';

export type Renderer = WebGLRenderer | WebGPURenderer;
