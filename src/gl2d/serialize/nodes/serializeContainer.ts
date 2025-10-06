import { type Container } from '../../../scene/container/Container';
import { type PixiGL2DContainer } from '../../spec/extensions/nodes';

import type { ToGL2DOptions } from '../../GL2D';

/**
 * Serializes the container and its children into a gl2D-compatible format.
 * @param container - The container to serialize.
 * @param gl2DOptions - The gl2D serialization context and options.
 * @returns The updated gl2D serialization context.
 * @internal
 */
export async function serializeContainer(container: Container, gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const node: PixiGL2DContainer = {
        name: container.label ?? undefined,
        type: 'container',
        uid: `${container.uid}`,
        children: [],
        alpha: container.alpha,
        visible: container.visible,
        tint: container.tint,
        blendMode: container.blendMode,
        matrix: Array.from(container.localTransform.toArray()) as [number, number, number, number, number, number],
        extensions: {
            pixi_container_node: {
                skew: [container.skew.x, container.skew.y],
                pivot: [container.pivot.x, container.pivot.y],
                origin: [container.origin.x, container.origin.y],
                boundsArea: container.boundsArea
                    ? [
                        container.boundsArea.x,
                        container.boundsArea.y,
                        container.boundsArea.width,
                        container.boundsArea.height,
                    ]
                    : undefined,
                isRenderGroup: container.isRenderGroup,
                zIndex: container.zIndex,
                sortableChildren: container.sortableChildren,
                renderable: container.renderable,
            },
        },
    };

    const { gl2D } = gl2DOptions;

    gl2D.nodes.push(node);
    gl2D.extensionsRequired.push('pixi_container_node');
    gl2D.extensionsUsed.push('pixi_container_node');

    // loop through children and serialize them
    for (const child of container.children)
    {
        // check if child already exists in gl2d
        const existingChildIndex = gl2D.nodes.findIndex((node) => node.uid === `${child.uid}`);

        if (existingChildIndex === -1)
        {
            await child.serialize(gl2DOptions);
            const childIndex = gl2D.nodes.findIndex((node) => node.uid === `${child.uid}`);

            node.children.push(childIndex);
        }
        else
        {
            node.children.push(existingChildIndex);
        }
    }

    return gl2DOptions;
}

/**
 * Mixin for serializing a container to a gl2D-compatible format.
 * @category gl2d
 * @standard
 */
export interface SerializeContainerMixin
{
    /**
     * Serializes the container to a gl2D-compatible format.
     * @param {ToGL2DOptions} gl2DOptions - The gl2D serialization context and options.
     */
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>;
}

/** @internal */
export const serializeContainerMixin: Partial<Container> = {
    serialize(gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
    {
        return serializeContainer(this, gl2DOptions);
    }
} as Container;
