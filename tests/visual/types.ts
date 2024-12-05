import type { Renderer, RendererOptions } from '~/rendering';
import type { Container } from '~/scene';

export type RenderType = 'webgl1' | 'webgl2' | 'webgpu';
export type RenderTypeFlags = Record<RenderType, boolean>;

export interface TestScene
{
    it: string;
    create: (scene: Container, renderer: Renderer) => Promise<void>;
    id?: string;
    options?: Partial<RendererOptions>;
    pixelMatch?: number;
    pixelMatchLocal?: number;
    skip?: boolean;
    skipCI?: boolean;
    only?: boolean;
    renderers?: Partial<RenderTypeFlags>;
}
