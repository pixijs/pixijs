import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';
import type { Gl2dNode, Gl2dResource } from './Gl2dSchema';

/**
 * Subset of Gl2dFile built up during serialization.
 * @category gl2d
 * @standard
 */
export interface ToGL2D
{
    nodes: Gl2dNode[];
    resources: Gl2dResource[];
    extensionsUsed: Set<string>;
    extensionsRequired: Set<string>;
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
}

/**
 * Context passed through the async serialization tree. Adds renderer access.
 * @category gl2d
 * @internal
 */
export interface Gl2dSerializeAsyncContext extends Gl2dSerializeContext
{
    renderer: Renderer;
}

/**
 * Creates a fresh sync serialization context.
 * @returns A new Gl2dSerializeContext
 * @category gl2d
 * @internal
 */
export function createSerializeContext(): Gl2dSerializeContext
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
    };
}

/**
 * Creates a fresh async serialization context with renderer access.
 * @param renderer - The renderer for texture extraction
 * @returns A new Gl2dSerializeAsyncContext
 * @category gl2d
 * @internal
 */
export function createSerializeAsyncContext(renderer: Renderer): Gl2dSerializeAsyncContext
{
    return {
        ...createSerializeContext(),
        renderer,
    };
}
