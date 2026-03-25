import { Color } from '../../color/Color';
import { warn } from '../../utils/logging/warn';
import { PIXI_CONTAINER_DEFAULTS } from '../defaults';
import { serializeCoreNodeProperties } from '../serializeCoreNodeProperties';
import { gl2dUtils } from '../utils';

import type { Container } from '../../scene/container/Container';
import type { Gl2dContainerNode, Gl2dPixiContainerExtension, Gl2dRef } from '../Gl2dSchema';
import type { Gl2dSerializeAsyncContext, Gl2dSerializeContext } from '../serializeContext';

interface ContainerSetup
{
    node: Gl2dContainerNode;
    index: Gl2dRef;
}

/**
 * Serializes the extensions for a container.
 * @param container - The container to serialize
 * @param node
 * @param ctx - The serialization context
 * @returns The serialized extensions
 * @category gl2d
 * @internal
 */
export function serializeContainerExtensions(container: Container, node: Gl2dContainerNode, ctx: Gl2dSerializeContext)
{
    const ext: Required<Gl2dPixiContainerExtension> = gl2dUtils.removeUndefinedOrNull(
        {
            origin: gl2dUtils.checkObservablePoint(container._origin, PIXI_CONTAINER_DEFAULTS.origin),
            skew: gl2dUtils.checkObservablePoint(container._skew, PIXI_CONTAINER_DEFAULTS.skew),
            pivot: gl2dUtils.checkObservablePoint(container._pivot, PIXI_CONTAINER_DEFAULTS.pivot),
            anchor: gl2dUtils.checkPoint((container as any)._anchor, PIXI_CONTAINER_DEFAULTS.anchor),
            width: gl2dUtils.checkValue(container.width, PIXI_CONTAINER_DEFAULTS.width),
            height: gl2dUtils.checkValue(container.height, PIXI_CONTAINER_DEFAULTS.height),
            tint: gl2dUtils.checkColor(Color.shared.setValue(container.tint), PIXI_CONTAINER_DEFAULTS.tint),
            blendMode: container.localBlendMode === 'inherit'
                ? null
                : gl2dUtils.checkValue(container.localBlendMode, PIXI_CONTAINER_DEFAULTS.blendMode),
            roundPixels: gl2dUtils.checkValue((container as any).roundPixels, PIXI_CONTAINER_DEFAULTS.roundPixels),
            zIndex: gl2dUtils.checkValue(container.zIndex, PIXI_CONTAINER_DEFAULTS.zIndex),
            isRenderGroup: gl2dUtils.checkValue(container.isRenderGroup, PIXI_CONTAINER_DEFAULTS.isRenderGroup),
            renderable: gl2dUtils.checkValue(container.renderable, PIXI_CONTAINER_DEFAULTS.renderable),
            boundsArea: gl2dUtils.checkRectangle(container.boundsArea, PIXI_CONTAINER_DEFAULTS.boundsArea),
            sortableChildren: gl2dUtils.checkValue(
                container.sortableChildren,
                PIXI_CONTAINER_DEFAULTS.sortableChildren,
            ),
            eventMode: gl2dUtils.checkValue(container.eventMode, PIXI_CONTAINER_DEFAULTS.eventMode),
            interactiveChildren: gl2dUtils.checkValue(
                container.interactiveChildren,
                PIXI_CONTAINER_DEFAULTS.interactiveChildren,
            ),
            cursor: gl2dUtils.checkValue(container.cursor, PIXI_CONTAINER_DEFAULTS.cursor),
            accessible: gl2dUtils.checkValue(container.accessible, PIXI_CONTAINER_DEFAULTS.accessible),
            accessibleChildren: gl2dUtils.checkValue(
                container.accessibleChildren,
                PIXI_CONTAINER_DEFAULTS.accessibleChildren,
            ),
            accessibleHint: gl2dUtils.checkValue(container.accessibleHint, PIXI_CONTAINER_DEFAULTS.accessibleHint),
            accessiblePointerEvents: gl2dUtils.checkValue(
                container.accessiblePointerEvents,
                PIXI_CONTAINER_DEFAULTS.accessiblePointerEvents,
            ),
            accessibleText: gl2dUtils.checkValue(container.accessibleText, PIXI_CONTAINER_DEFAULTS.accessibleText),
            accessibleTitle: gl2dUtils.checkValue(container.accessibleTitle, PIXI_CONTAINER_DEFAULTS.accessibleTitle),
            accessibleType: gl2dUtils.checkValue(container.accessibleType, PIXI_CONTAINER_DEFAULTS.accessibleType),
            tabIndex: gl2dUtils.checkValue(container.tabIndex, PIXI_CONTAINER_DEFAULTS.tabIndex),
            cullArea: gl2dUtils.checkRectangle(container.cullArea, PIXI_CONTAINER_DEFAULTS.cullArea),
            cullableChildren: gl2dUtils.checkValue(
                container.cullableChildren,
                PIXI_CONTAINER_DEFAULTS.cullableChildren,
            ),
            cullable: gl2dUtils.checkValue(container.cullable, PIXI_CONTAINER_DEFAULTS.cullable),
        },
        1,
    );

    if (Object.keys(ext).length > 0)
    {
        node.extensions = { pixi_container_node: ext };
        ctx.gl2d.extensionsUsed.add('pixi_container_node');
    }

    return ext;
}

function setupContainerNode(container: Container, ctx: Gl2dSerializeContext): ContainerSetup | Gl2dRef
{
    const existing = ctx.nodeMap.get(container);

    if (existing !== undefined) return existing;

    if (container.renderPipeId && container.renderPipeId !== 'container')
    {
        warn(
            `[gl2d] "${container.label || container.uid}" has renderPipeId "${container.renderPipeId}"`
                + ' but no serializer; serializing as container (type-specific data lost)',
        );
    }

    const core = serializeCoreNodeProperties(container, ctx);
    const node = { type: 'container', ...core } as Gl2dContainerNode;

    serializeContainerExtensions(container, node, ctx);
    const index = ctx.gl2d.nodes.length;

    ctx.gl2d.nodes.push(node);
    ctx.nodeMap.set(container, index);

    return { node, index };
}

function applyMask(node: Gl2dContainerNode, container: Container, maskRef: Gl2dRef): void
{
    node.mask = {
        node: maskRef,
        inverse: container._maskOptions?.inverse ?? false,
    };
}

/**
 * Serializes a Container into a gl2d node (sync).
 * @param container - The container to serialize
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.nodes
 * @category gl2d
 * @standard
 */
export function serializeContainer(container: Container, ctx: Gl2dSerializeContext): Gl2dRef
{
    const result = setupContainerNode(container, ctx);

    if (typeof result !== 'object') return result;

    const { node, index } = result;
    const children = container.children;

    for (let i = 0; i < children.length; i++)
    {
        (node.children ??= []).push((children[i] as Container).toGl2d(ctx));
    }

    const mask = container.mask;

    // eslint-disable-next-line no-eq-null, eqeqeq
    if (mask != null)
    {
        if (typeof mask === 'number')
        {
            warn('[gl2d] Mask is a number, which is not supported');

            return index;
        }
        applyMask(node, container, mask.toGl2d(ctx));
    }

    return index;
}

/**
 * Serializes a Container into a gl2d node (async).
 * @param container - The container to serialize
 * @param ctx - The async serialization context
 * @returns Promise resolving to index into ctx.gl2d.nodes
 * @category gl2d
 * @standard
 */
export async function serializeContainerAsync(container: Container, ctx: Gl2dSerializeAsyncContext): Promise<Gl2dRef>
{
    const result = setupContainerNode(container, ctx);

    if (typeof result !== 'object') return result;

    const { node, index } = result;
    const children = container.children;

    for (let i = 0; i < children.length; i++)
    {
        (node.children ??= []).push(await (children[i] as Container).toGl2dAsync(ctx));
    }

    const mask = container.mask;

    // eslint-disable-next-line no-eq-null, eqeqeq
    if (mask != null)
    {
        if (typeof mask === 'number')
        {
            warn('[gl2d] Mask is a number, which is not supported');

            return index;
        }
        applyMask(node, container, await (mask as Container).toGl2dAsync(ctx));
    }

    return index;
}
