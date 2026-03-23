import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { State } from '../../../rendering/renderers/shared/state/State';
import type { Renderer } from '../../../rendering/renderers/types';
import type { Graphics } from './Graphics';

/**
 * Minimal pipe surface exposed to adaptor execute methods.
 * @internal
 */
export interface GraphicsPipeLike
{
    renderer: Renderer;
    state: State;
}

/**
 * Shared interface for GL/GPU graphics adaptors.
 * Works for both Graphics and SmoothGraphics (which extends Graphics).
 * @internal
 */
export interface GraphicsAdaptor
{
    shader: Shader;
    contextChange(renderer: Renderer): void;
    execute(graphicsPipe: GraphicsPipeLike, renderable: Graphics): void;
    destroy(): void;
}
