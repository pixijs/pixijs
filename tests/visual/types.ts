import type { RendererOptions } from '../../src/rendering/renderers/types';
import type { Container } from '../../src/scene/container/Container';

export interface TestScene
{
    it: string;
    create: (scene: Container) => Promise<void>;
    id?: string;
    options?: Partial<RendererOptions>;
    pixelMatch?: number;
    skip?: boolean;
    renderers?: {
        canvas: boolean,
        webgl: boolean,
        webgpu: boolean,
    }
}
