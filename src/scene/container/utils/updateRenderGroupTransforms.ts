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
            root.relativeGroupTransform,
            renderGroupParent.worldTransform,
        );

        renderGroup.worldColor = mixColors(
            root.groupColor,
            renderGroupParent.worldColor,
        );

        worldAlpha = root.groupAlpha * renderGroupParent.worldAlpha;
    }
    else
    {
        renderGroup.worldTransform.copyFrom(root.localTransform);
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

    if ((parent && !parent.isRenderGroupRoot))
    {
        updateFlags = updateFlags | container._updateFlags;

        container.relativeGroupTransform.appendFrom(
            localTransform,
            parent.relativeGroupTransform,
        );

        if (updateFlags)
        {
            updateColorBlendVisibility(container, parent, updateFlags);
        }
    }
    else
    {
        updateFlags = container._updateFlags;

        container.relativeGroupTransform.copyFrom(localTransform);

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

        if (container.renderPipeId && !renderGroup.structureDidChange)
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
        container.groupColor = mixColors(
            container.localColor,
            parent.groupColor
        );

        let groupAlpha = container.localAlpha * parent.groupAlpha;

        // eslint-disable-next-line no-nested-ternary
        groupAlpha = groupAlpha < 0 ? 0 : (groupAlpha > 1 ? 1 : groupAlpha);

        container.groupAlpha = groupAlpha;
        container.groupColorAlpha = container.groupColor + (((groupAlpha * 255) | 0) << 24);
    }

    if (updateFlags & UPDATE_BLEND)
    {
        container.groupBlendMode = container.localBlendMode === 'inherit' ? parent.groupBlendMode : container.localBlendMode;
    }

    if (updateFlags & UPDATE_VISIBLE)
    {
        container.groupVisibleRenderable = container.localVisibleRenderable & parent.groupVisibleRenderable;
    }

    container._updateFlags = 0;
}

