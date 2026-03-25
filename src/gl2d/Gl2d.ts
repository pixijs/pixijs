import { createSerializeAsyncContext, createSerializeContext } from './serializeContext';

import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';
import type { Gl2dFile, Gl2dRef } from './Gl2dSchema';
import type { Gl2dSerializeContext } from './serializeContext';

function buildGl2dFile(rootRef: Gl2dRef, ctx: Gl2dSerializeContext): Gl2dFile
{
    const { nodes, resources, extensionsUsed, extensionsRequired } = ctx.gl2d;
    const sceneName = (typeof rootRef === 'number' ? nodes[rootRef]?.name : undefined) ?? 'scene';

    return {
        asset: { version: '1.0', generator: 'pixi.js' },
        scene: 0,
        scenes: [{ name: sceneName, nodes: [rootRef] }],
        nodes,
        resources: resources.length > 0 ? resources : undefined,
        extensionsUsed: extensionsUsed.size > 0 ? [...extensionsUsed] : undefined,
        extensionsRequired: extensionsRequired.size > 0 ? [...extensionsRequired] : undefined,
    };
}

/**
 * Top-level API for serializing a PixiJS scene graph into the gl2D file format.
 *
 * Import `gl2d/init` to register the serialization mixins before calling these methods.
 * @example
 * ```ts
 * import 'pixi.js/gl2d/init';
 * import { Gl2d } from 'pixi.js/gl2d';
 *
 * const file = Gl2d.serialize(stage);
 * ```
 * @category gl2d
 * @standard
 */
export const Gl2d = {
    /**
     * Synchronously serialize a scene graph into a Gl2dFile.
     * Textures with URLs produce URI references; canvas-backed sources use toDataURL.
     * @param root - Root container of the scene graph
     * @returns A complete Gl2dFile
     */
    serialize(root: Container): Gl2dFile
    {
        const ctx = createSerializeContext();
        const rootRef = root.toGl2d(ctx);

        return buildGl2dFile(rootRef, ctx);
    },

    /**
     * Asynchronously serialize a scene graph into a Gl2dFile.
     * Uses the renderer to extract textures that lack URLs.
     * @param root - Root container of the scene graph
     * @param renderer - The renderer for texture extraction
     * @returns A complete Gl2dFile
     */
    async serializeAsync(root: Container, renderer: Renderer): Promise<Gl2dFile>
    {
        const ctx = createSerializeAsyncContext(renderer);
        const rootRef = await root.toGl2dAsync(ctx);

        return buildGl2dFile(rootRef, ctx);
    },
};
