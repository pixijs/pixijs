import { Container, UPDATE_BLEND, UPDATE_COLOR, UPDATE_VISIBLE } from '../Container';
import { mixColors } from './mixColors';
import { updateLocalTransform } from './updateLocalTransform';

import type { LayerGroup } from '../LayerGroup';

const tempContainer = new Container();

export function updateLayerGroupTransforms(layerGroup: LayerGroup, updateChildRenderGroups = false)
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
        for (let i = 0; i < layerGroup.layerGroupChildren.length; i++)
        {
            updateLayerGroupTransforms(layerGroup.layerGroupChildren[i], updateChildRenderGroups);
        }
    }
}

export function updateLayerTransform(layerGroup: LayerGroup)
{
    if (layerGroup.layerGroupParent)
    {
        layerGroup.worldTransform.appendFrom(
            layerGroup.root.layerTransform,
            layerGroup.layerGroupParent.worldTransform,
        );

        layerGroup.worldColor = mixColors(
            layerGroup.root.layerColor,
            layerGroup.layerGroupParent.worldColor,
        );
    }
    else
    {
        layerGroup.worldTransform.copyFrom(layerGroup.root.layerTransform);
        layerGroup.worldColor = layerGroup.root.localColor;
    }
}

export function updateTransformAndChildren(container: Container, updateTick: number, updateFlags: number)
{
    if (updateTick === container.updateTick) return;
    container.updateTick = updateTick;

    container.didChange = false;

    const localTransform = container.localTransform;

    updateLocalTransform(localTransform, container);

    const parent = container.parent;

    if (parent && !parent.isLayerRoot)
    {
        updateFlags = updateFlags | container._updateFlags;

        container.layerTransform.appendFrom(
            localTransform,
            parent.layerTransform,
        );

        if (updateFlags)
        {
            updateColorBlendVisibility(container, parent, updateFlags);
        }
    }
    else
    {
        updateFlags = container._updateFlags;

        container.layerTransform.copyFrom(localTransform);

        if (updateFlags)
        {
            updateColorBlendVisibility(container, tempContainer, updateFlags);
        }
    }

    // don't update children if its a layer..
    if (!container.isLayerRoot)
    {
        const children = container.children;
        const length = children.length;

        for (let i = 0; i < length; i++)
        {
            updateTransformAndChildren(children[i], updateTick, updateFlags);
        }

        const layerGroup = container.layerGroup;

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
        container.layerColor = mixColors(container.localColor, parent.layerColor);
    }

    if (updateFlags & UPDATE_BLEND)
    {
        container.layerBlendMode = container.localBlendMode === 'inherit' ? parent.layerBlendMode : container.localBlendMode;
    }

    if (updateFlags & UPDATE_VISIBLE)
    {
        container.layerVisibleRenderable = container.localVisibleRenderable & parent.layerVisibleRenderable;
    }

    container._updateFlags = 0;
}

