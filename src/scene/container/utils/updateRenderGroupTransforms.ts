import { Container, UPDATE_BLEND, UPDATE_COLOR, UPDATE_VISIBLE } from '../Container';
import { mixColors } from './mixColors';
import { updateLocalTransform } from './updateLocalTransform';

import type { RenderGroup } from '../RenderGroup';

const tempContainer = new Container();

export function updateRenderGroupTransforms(renderGroup: RenderGroup, updateChildRenderGroups = false)
{
    updateRenderGroupTransform(renderGroup);

    const childrenToUpdate = renderGroup.childrenToUpdate;

    const updateTick = renderGroup.updateTick;

    renderGroup.updateTick++;

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
        for (let i = 0; i < renderGroup.renderGroupChildren.length; i++)
        {
            updateRenderGroupTransforms(renderGroup.renderGroupChildren[i], updateChildRenderGroups);
        }
    }
}

export function updateRenderGroupTransform(renderGroup: RenderGroup)
{
    const root = renderGroup.root;

    let worldAlpha;

    if (renderGroup.renderGroupParent)
    {
        const renderGroupParent = renderGroup.renderGroupParent;

        renderGroup.worldTransform.appendFrom(
            root.rgTransform,
            renderGroupParent.worldTransform,
        );

        renderGroup.worldColor = mixColors(
            root.rgColor,
            renderGroupParent.worldColor,
        );

        worldAlpha = root.rgAlpha * renderGroupParent.worldAlpha;
    }
    else
    {
        renderGroup.worldTransform.copyFrom(root.rgTransform);
        renderGroup.worldColor = root.localColor;
        worldAlpha = root.localAlpha;
    }

    // eslint-disable-next-line no-nested-ternary
    worldAlpha = worldAlpha < 0 ? 0 : (worldAlpha > 1 ? 1 : worldAlpha);

    renderGroup.worldAlpha = worldAlpha;
    renderGroup.worldColorAlpha = renderGroup.worldColor
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

        container.rgTransform.appendFrom(
            localTransform,
            parent.rgTransform,
        );

        if (updateFlags)
        {
            updateColorBlendVisibility(container, parent, updateFlags);
        }
    }
    else
    {
        updateFlags = container._updateFlags;

        container.rgTransform.copyFrom(localTransform);

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

        const renderGroup = container.renderGroup;

        if (container.view && !renderGroup.structureDidChange)
        {
            renderGroup.updateRenderable(container);
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

        const rgAlpha = container.localAlpha * parent.rgAlpha;

        // eslint-disable-next-line no-nested-ternary
        container.rgAlpha = rgAlpha < 0 ? 0 : (rgAlpha > 1 ? 1 : rgAlpha);

        container.rgColorAlpha = container.rgColor + (((rgAlpha * 255) | 0) << 24);
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

