import { Container, UPDATE_BLEND, UPDATE_COLOR, UPDATE_VISIBLE } from '../Container';
import { mixColors } from './mixColors';
import { updateLocalTransform } from './updateLocalTransform';

import type { RenderGroup } from '../RenderGroup';

const tempContainer = new Container();

export function updateLayerGroupTransforms(layerGroup: RenderGroup, updateChildRenderGroups = false)
{
    updateLayerTransform(layerGroup);

    const childrenToUpdate = layerGroup.childrenToUpdate;

    const updateTick = layerGroup.updateTick;

    layerGroup.updateTick++;

    for (const j in childrenToUpdate)
    {
        const childrenAtDepth = childrenToUpdate[j];

        const list = childrenAtDepth.list;
        const index = childrenAtDepth.index;

        for (let i = 0; i < index; i++)
        {
            updateTransformAndChildren(list[i], updateTick, 0);
        }

        childrenAtDepth.index = 0;
    }

    if (updateChildRenderGroups)
    {
        for (let i = 0; i < layerGroup.renderGroupChildren.length; i++)
        {
            updateLayerGroupTransforms(layerGroup.renderGroupChildren[i], updateChildRenderGroups);
        }
    }
}

export function updateLayerTransform(layerGroup: RenderGroup)
{
    const root = layerGroup.root;

    let worldAlpha;

    if (layerGroup.renderGroupParent)
    {
        const layerGroupParent = layerGroup.renderGroupParent;

        layerGroup.worldTransform.appendFrom(
            root.renderGroupTransform,
            layerGroupParent.worldTransform,
        );

        layerGroup.worldColor = mixColors(
            root.rgColor,
            layerGroupParent.worldColor,
        );

        worldAlpha = root.rgAlpha * layerGroupParent.worldAlpha;
    }
    else
    {
        layerGroup.worldTransform.copyFrom(root.renderGroupTransform);
        layerGroup.worldColor = root.localColor;
        worldAlpha = root.localAlpha;
    }

    // eslint-disable-next-line no-nested-ternary
    worldAlpha = worldAlpha < 0 ? 0 : (worldAlpha > 1 ? 1 : worldAlpha);

    layerGroup.worldAlpha = worldAlpha;
    layerGroup.worldColorAlpha = layerGroup.worldColor
            + (((worldAlpha * 255) | 0) << 24);
}

export function updateTransformAndChildren(container: Container, updateTick: number, updateFlags: number)
{
    if (updateTick === container.updateTick) return;
    container.updateTick = updateTick;

    container.didChange = false;

    const localTransform = container.localTransform;

    updateLocalTransform(localTransform, container);

    const parent = container.parent;

    if (parent && !parent.isRenderGroupRoot)
    {
        updateFlags = updateFlags | container._updateFlags;

        container.renderGroupTransform.appendFrom(
            localTransform,
            parent.renderGroupTransform,
        );

        if (updateFlags)
        {
            updateColorBlendVisibility(container, parent, updateFlags);
        }
    }
    else
    {
        updateFlags = container._updateFlags;

        container.renderGroupTransform.copyFrom(localTransform);

        if (updateFlags)
        {
            updateColorBlendVisibility(container, tempContainer, updateFlags);
        }
    }

    // don't update children if its a layer..
    if (!container.isRenderGroupRoot)
    {
        const children = container.children;
        const length = children.length;

        for (let i = 0; i < length; i++)
        {
            updateTransformAndChildren(children[i], updateTick, updateFlags);
        }

        const layerGroup = container.renderGroup;

        if (container.view && !layerGroup.structureDidChange)
        {
            layerGroup.updateRenderable(container);
        }
    }
}

function updateColorBlendVisibility(
    container: Container,
    parent: Container,
    updateFlags: number,
): void
{
    if (updateFlags & UPDATE_COLOR)
    {
        container.rgColor = mixColors(
            container.localColor,
            parent.rgColor
        );

        const layerAlpha = container.localAlpha * parent.rgAlpha;

        // eslint-disable-next-line no-nested-ternary
        container.rgAlpha = layerAlpha < 0 ? 0 : (layerAlpha > 1 ? 1 : layerAlpha);

        container.rgColorAlpha = container.rgColor + (((layerAlpha * 255) | 0) << 24);
    }

    if (updateFlags & UPDATE_BLEND)
    {
        container.rgBlendMode = container.localBlendMode === 'inherit' ? parent.rgBlendMode : container.localBlendMode;
    }

    if (updateFlags & UPDATE_VISIBLE)
    {
        container.rgVisibleRenderable = container.localVisibleRenderable & parent.rgVisibleRenderable;
    }

    container._updateFlags = 0;
}

