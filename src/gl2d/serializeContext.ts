import { type Gl2dNodeExtensionName } from './types/Gl2DExtensions';
import { type Gl2dResourceExtensionName } from './types/Gl2DResources';
import { type Gl2dPixiNode } from './types/pixi/PixiGl2dNodes';
import { type Gl2dPixiResource } from './types/pixi/PixiGl2dResources';

import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';

/**
 * Subset of Gl2dFile built up during serialization.
 * @category gl2d
 * @standard
 */
export interface ToGL2D
{
    nodes: Gl2dPixiNode[];
    resources: Gl2dPixiResource[];
    extensionsUsed: Set<Gl2dNodeExtensionName | Gl2dResourceExtensionName>;
    extensionsRequired: Set<Gl2dNodeExtensionName | Gl2dResourceExtensionName>;
}

/**
 * Context passed through the sync serialization tree.
 * @category gl2d
 * @internal
 */
export interface Gl2dSerializeContext
{
    gl2d: ToGL2D;
    resourceMap: Map<object, number>;
    nodeMap: Map<Container, number>;
    renderer?: Renderer;
}

/**
 * Creates a fresh sync serialization context.
 * @param renderer - The renderer for texture extraction
 * @returns A new Gl2dSerializeContext
 * @category gl2d
 * @internal
 */
export function createSerializeContext(renderer?: Renderer): Gl2dSerializeContext
{
    return {
        gl2d: {
            nodes: [],
            resources: [],
            extensionsUsed: new Set(),
            extensionsRequired: new Set(),
        },
        resourceMap: new Map(),
        nodeMap: new Map(),
        renderer,
    };
}
