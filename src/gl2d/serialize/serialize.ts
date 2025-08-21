import { type Renderer } from '../../rendering/renderers/types';
import { type Container } from '../../scene/container/Container';
import { type GL2DFile, type ToGL2D } from '../file';
import { deepRemoveUndefined } from '../utils/deepRemoveUndefined';

/**
 * Options for serializing a PixiJS v8 scene graph into a GL2D scene file.
 * @category gl2d
 * @standard
 */
export interface ToGL2DOptions
{
    gl2D?: ToGL2D;
    renderer: Renderer;
}

/**
 * Serialize a PixiJS v8 scene graph into a GL2D scene file.
 * @param options - The options for serialization
 * @param options.root - The root container for the active scene
 * @param options.renderer - The renderer instance
 * @returns The serialized GL2D JSON object
 * @category gl2d
 * @standard
 */
export async function serializeGL2D(options: { root: Container, renderer: Renderer }): Promise<GL2DFile>
{
    const { root, renderer } = options;

    const gl2D: GL2DFile = {
        asset: {
            generator: 'PixiJS',
            version: '1.0'
        },
        extensionsUsed: [],
        extensionsRequired: [],
        resources: [],
        nodes: [],
    };

    await root.serialize({ gl2D, renderer });

    // Ensure no duplicates if serializers pushed extensions multiple times
    if (gl2D.extensionsUsed) gl2D.extensionsUsed = Array.from(new Set(gl2D.extensionsUsed));
    if (gl2D.extensionsRequired) gl2D.extensionsRequired = Array.from(new Set(gl2D.extensionsRequired));

    return deepRemoveUndefined(gl2D);
}
