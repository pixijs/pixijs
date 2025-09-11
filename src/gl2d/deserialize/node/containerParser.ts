import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { Container, type ContainerOptions } from '../../../scene/container/Container';
import { type PixiGL2DContainer } from '../../spec/extensions/nodes';
import { type GL2DNode } from '../../spec/node';
import { deepRemoveUndefinedOrNull } from '../../utils/deepRemoveUndefinedOrNull';
import { type GL2DNodeParser } from '../parsers';
import { toPointData, toRectangle } from '../utils/arrayTo';

/**
 * A type representing the options for a container created from a GL2D container.
 * It omits transform-related properties as these are handled separately.
 */
type ContainerOptionsFromGL2D = Omit<
    Required<ContainerOptions>,
    | 'position'
    | 'scale'
    | 'rotation'
    | 'x'
    | 'y'
    | 'sortDirty'
    | 'interactive'
    | 'parent'
    | 'angle'
    | 'children'
    | 'mask'
    | 'setMask'
    | `on${string}`
>;

/**
 * Create container options from a GL2D container.
 * @param data
 * @returns container options
 * @internal
 */
export function createContainerOptionsFromGl2D(data: Omit<PixiGL2DContainer, 'type'>): ContainerOptions
{
    const properties: Required<ContainerOptionsFromGL2D> = deepRemoveUndefinedOrNull(
        {
            label: data.name,
            alpha: data.alpha,
            visible: data.visible,
            tint: data.tint,
            blendMode: data.blendMode,
            width: data.width,
            height: data.height,
            skew: toPointData(data.extensions?.pixi_container_node?.skew),
            pivot: toPointData(data.extensions?.pixi_container_node?.pivot),
            origin: toPointData(data.extensions?.pixi_container_node?.origin),
            boundsArea: toRectangle(data.extensions?.pixi_container_node?.boundsArea),
            isRenderGroup: data.extensions?.pixi_container_node?.isRenderGroup,
            zIndex: data.extensions?.pixi_container_node?.zIndex ?? 0,
            sortableChildren: data.extensions?.pixi_container_node?.sortableChildren,
            renderable: data.extensions?.pixi_container_node?.renderable ?? true,
            tabIndex: data.extensions?.pixi_container_node?.tabIndex,
            interactive: data.extensions?.pixi_container_node?.interactive,
            interactiveChildren: data.extensions?.pixi_container_node?.interactiveChildren,
            eventMode: data.extensions?.pixi_container_node?.eventMode,
            cursor: data.extensions?.pixi_container_node?.cursor,
            accessible: data.extensions?.pixi_container_node?.accessible,
            accessibleChildren: data.extensions?.pixi_container_node?.accessibleChildren,
            accessibleHint: data.extensions?.pixi_container_node?.accessibleHint,
            accessiblePointerEvents: data.extensions?.pixi_container_node?.accessiblePointerEvents,
            accessibleText: data.extensions?.pixi_container_node?.accessibleText,
            accessibleTitle: data.extensions?.pixi_container_node?.accessibleTitle,
            accessibleType: data.extensions?.pixi_container_node?.accessibleType,
            cullArea: toRectangle(data.extensions?.pixi_container_node?.cullArea),
            cullableChildren: data.extensions?.pixi_container_node?.cullableChildren,
            cullable: data.extensions?.pixi_container_node?.cullable,
            // TODO: Remaining properties to support
            filters: undefined,
            hitArea: undefined,
            cacheAsTexture: undefined,
        },
        1,
    );

    return properties;
}

/**
 * Set the transform properties of a container from a GL2D container.
 * @param container - The container to set the transform properties on.
 * @param data - The GL2D container data.
 * @internal
 */
export function setContainerTransformFromGL2D(container: Container, data: GL2DNode): void
{
    if (data.matrix)
    {
        const matrix = new Matrix(...data.matrix);

        container.setFromMatrix(matrix);
    }
    else
    {
        data.translation && container.position.set(data.translation[0], data.translation[1]);
        data.scale && container.scale.set(data.scale[0], data.scale[1]);
        data.rotation !== undefined && (container.rotation = data.rotation);
    }
}

/**
 * Parser for GL2D container nodes.
 * @internal
 */
export const gl2DContainerNodeParser: GL2DNodeParser<PixiGL2DContainer> = {
    extension: ExtensionType.GL2DNodeParser,

    async test(data: PixiGL2DContainer): Promise<boolean>
    {
        return data.type === 'container';
    },

    async parse(data: PixiGL2DContainer): Promise<Container>
    {
        const container = new Container(createContainerOptionsFromGl2D(data));

        setContainerTransformFromGL2D(container, data);

        return container;
    },
};
