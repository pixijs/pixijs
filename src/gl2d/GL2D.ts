import { type GL2DFile } from './spec/file';
import { deepRemoveUndefinedOrNull } from './utils/deepRemoveUndefinedOrNull';

import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';

/**
 * Represents the nodes and resources of a gl2D file for JSON serialization.
 * @category gl2d
 * @standard
 */
export type ToGL2D = Pick<GL2DFile, 'resources' | 'nodes' | 'extensionsRequired' | 'extensionsUsed'>;

/**
 * Options for serializing a PixiJS v8 scene graph into a gl2D scene file.
 * @category gl2d
 * @standard
 */
export interface ToGL2DOptions
{
    gl2D?: ToGL2D;
    renderer: Renderer;
}

/** @internal */
export class GL2DClass
{
    /**
     * Serialize a PixiJS v8 scene graph into a gl2D scene file.
     * @param options - The options for serialization
     * @param options.root - The root container for the active scene
     * @param options.renderer - The renderer instance
     * @returns The serialized gl2D JSON object
     * @category gl2d
     * @standard
     */
    public async serialize(options: { root: Container, renderer: Renderer }): Promise<GL2DFile>
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

        return deepRemoveUndefinedOrNull(gl2D);
    }

    public async deserialize(_data: GL2DFile): Promise<void>
    {
        // Deserialization logic for gl2D assets
    }
}

/**
 * Represents the core functionality for working with gl2D assets.
 * @category gl2d
 * @class
 * @standard
 */
export const GL2D = new GL2DClass();
