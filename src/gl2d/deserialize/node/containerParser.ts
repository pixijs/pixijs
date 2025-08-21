import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { Container } from '../../../scene/container/Container';
import { type PixiGL2DContainer } from '../../extensions/nodes';
import { type GL2DNode } from '../../node';
import { type GL2DNodeParser } from '../parsers';
import { toRectangle } from '../utils/arrayTo';

/**
 * Applies base properties from a GL2D container node to a PixiJS container.
 * @param container - The PixiJS container to modify.
 * @param data - The GL2D container node data.
 * @internal
 */
export function applyBaseNodeProperties(container: Container, data: Omit<PixiGL2DContainer, 'type'>): void
{
    if (data.name) container.label = data.name;
    if (data.alpha !== undefined) container.alpha = data.alpha;
    if (data.visible !== undefined) container.visible = data.visible;
    if (data.tint !== undefined) container.tint = data.tint;
    if (data.blendMode) container.blendMode = data.blendMode;

    // Apply transform
    if (data.matrix)
    {
        const matrix = new Matrix(...data.matrix);

        container.setFromMatrix(matrix);
    }
    else
    {
        if (data.translation)
        {
            container.position.set(data.translation[0], data.translation[1]);
        }

        if (data.scale)
        {
            container.scale.set(data.scale[0], data.scale[1]);
        }

        if (data.rotation !== undefined)
        {
            container.rotation = data.rotation;
        }
    }

    // Apply explicit size if provided
    if (data.width !== undefined || data.height !== undefined)
    {
        container.setSize(data.width ?? container.width, data.height ?? container.height);
    }

    // Apply container-specific properties
    const extension = data.extensions?.pixi_container_node;

    if (extension)
    {
        container.skew.set(extension.skew[0], extension.skew[1]);
        container.pivot.set(extension.pivot[0], extension.pivot[1]);
        container.origin.set(extension.origin[0], extension.origin[1]);

        container.boundsArea = toRectangle(extension.boundsArea);

        container.isRenderGroup = extension.isRenderGroup ?? false;
        container.zIndex = extension.zIndex ?? 0;
        container.sortableChildren = extension.sortableChildren ?? false;
        container.renderable = extension.renderable ?? true;
    }
}

/**
 * Parser for GL2D container nodes.
 * @internal
 */
export const gl2DContainerNodeParser: GL2DNodeParser<PixiGL2DContainer> = {
    extension: ExtensionType.GL2DNodeParser,

    async test(data: GL2DNode): Promise<boolean>
    {
        return data.type === 'container';
    },

    async parse(data: PixiGL2DContainer): Promise<Container>
    {
        const container = new Container();

        // Apply base node properties
        applyBaseNodeProperties(container, data);

        return container;
    }
};
