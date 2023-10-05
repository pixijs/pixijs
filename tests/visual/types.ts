import type { Renderer, RendererOptions } from '../../src/rendering/renderers/types';
import type { Container } from '../../src/scene/container/Container';

export interface TestScene
{
    it: string;
    create: (scene: Container, renderer: Renderer) => Promise<void>;
    id?: string;
    options?: Partial<RendererOptions>;
    pixelMatch?: number;
    skip?: boolean;
    only?: boolean;
    renderers?: {
        canvas?: boolean,
        webgl?: boolean,
        webgpu?: boolean,
    }
}
