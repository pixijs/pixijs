import type { System } from '../system/System';

/**
 * System plugin to the renderer to manage the shaders.
 * @category rendering
 * @advanced
 */
export interface ShaderSystem extends System
{
    /** the maximum number of textures that can be bound to a shader */
    readonly maxTextures: number;
}
