import type { Renderer, RendererOptions } from '../../src/rendering/renderers/types';
import type { Container } from '../../src/scene/container/Container';

export type RenderType = 'webgl1' | 'webgl2' | 'webgpu';
export type RenderTypeFlags = Record<RenderType, boolean>;

export interface TestScene
{
    it: string;
    create: (scene: Container, renderer: Renderer) => Promise<void>;
    id?: string;
    options?: Partial<RendererOptions>;
    pixelMatch?: number;
    skip?: boolean;
    skipCI?: boolean;
    only?: boolean;
    renderers?: Partial<RenderTypeFlags>;
}
