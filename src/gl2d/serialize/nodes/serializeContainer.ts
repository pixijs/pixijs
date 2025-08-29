import { type PointData } from '../../../maths/point/PointData';
import { type Container } from '../../../scene/container/Container';
import { type PixiGL2DContainer } from '../../spec/extensions/nodes';

import type { ToGL2DOptions } from '../../GL2D';

function checkDefaultPoint(point: PointData): boolean
{
    return point.x === 0 && point.y === 0;
}

/**
 * Serializes the container and its children into a gl2D-compatible format.
 * @param instance - The container to serialize.
 * @param gl2DOptions - The gl2D serialization context and options.
 * @returns The updated gl2D serialization context.
 * @internal
 */
export async function serializeContainer(instance: Container, gl2DOptions: ToGL2DOptions): Promise<ToGL2DOptions>
{
    const node: PixiGL2DContainer = {
        name: instance.label ?? undefined,
        type: 'container',
        uid: `${instance.uid}`,
        children: [],
        alpha: instance.alpha,
        visible: instance.visible,
        tint: instance.tint,
        blendMode: instance.blendMode,
        matrix: [
            instance.localTransform.a,
            instance.localTransform.b,
            instance.localTransform.c,
            instance.localTransform.d,
            instance.localTransform.tx,
            instance.localTransform.ty
        ],
        extensions: {
            pixi_container_node: {
                skew: !checkDefaultPoint(instance._skew) ? [instance.skew.x, instance.skew.y] : undefined,
                pivot: !checkDefaultPoint(instance._pivot) ? [instance.pivot.x, instance.pivot.y] : undefined,
                origin: !checkDefaultPoint(instance._origin) ? [instance.origin.x, instance.origin.y] : undefined,
                boundsArea: instance.boundsArea
                    ? [instance.boundsArea.x, instance.boundsArea.y, instance.boundsArea.width, instance.boundsArea.height]
                    : undefined,
                isRenderGroup: instance.isRenderGroup,
                zIndex: instance.zIndex,
                sortableChildren: instance.sortableChildren,
                renderable: instance.renderable,
                tabIndex: instance.tabIndex,
                interactiveChildren: instance.interactiveChildren,
                interactive: instance.interactive,
                eventMode: instance.eventMode,
                cursor: instance.cursor,
                cullArea: instance.cullArea
                    ? [instance.cullArea.x, instance.cullArea.y, instance.cullArea.width, instance.cullArea.height]
                    : undefined,
                cullableChildren: instance.cullableChildren,
                cullable: instance.cullable,
                accessibleType: instance.accessibleType,
                accessibleTitle: instance.accessibleTitle,
                accessibleText: instance.accessibleText,
                accessiblePointerEvents: instance.accessiblePointerEvents,
                accessibleHint: instance.accessibleHint,
                accessibleChildren: instance.accessibleChildren,
                accessible: instance.accessible,
            }
        }
    };

    const { gl2D } = gl2DOptions;

    if (instance.mask !== undefined)
    {
        const mask = instance.mask as Container;
        let existingMaskIndex = gl2D.nodes.findIndex((node) => node.uid === `${mask.uid}`);

        if (existingMaskIndex === -1)
        {
            await mask.serialize(gl2DOptions);
            existingMaskIndex = gl2D.nodes.findIndex((node) => node.uid === `${mask.uid}`);
        }

        // eslint-disable-next-line dot-notation
        node.mask = { node: existingMaskIndex, inverse: instance['_maskOptions'].inverse };
    }

    gl2D.nodes.push(node);
    gl2D.extensionsRequired.push('pixi_container_node');
    gl2D.extensionsUsed.push('pixi_container_node');

    // loop through children and serialize them
    for (const child of instance.children)
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
