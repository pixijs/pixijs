import type { Renderer, RendererOptions } from '~/rendering/renderers/types';
import type { Container } from '~/scene/container/Container';

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
