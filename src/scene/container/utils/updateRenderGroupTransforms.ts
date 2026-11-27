import { Container, UPDATE_BLEND, UPDATE_COLOR, UPDATE_VISIBLE } from '../Container';
import { renderPass } from '../renderPass';
import { clearList } from './clearList';
import { multiplyColors } from './multiplyColors';

import type { ViewContainer } from '../../view/ViewContainer';
import type { RenderGroup } from '../RenderGroup';

const tempContainer = new Container();
const UPDATE_BLEND_COLOR_VISIBLE = UPDATE_VISIBLE | UPDATE_COLOR | UPDATE_BLEND;

/**
 * @param renderGroup
 * @param updateChildRenderGroups
 * @internal
 */
export function updateRenderGroupTransforms(renderGroup: RenderGroup, updateChildRenderGroups = false)
{
    updateRenderGroupTransform(renderGroup);

    const childrenToUpdate = renderGroup.childrenToUpdate;

    const updateTick = renderGroup.updateTick++;

    for (const j in childrenToUpdate)
    {
        const renderGroupDepth = Number(j);

        const childrenAtDepth = childrenToUpdate[j];

        const list = childrenAtDepth.list;
        const index = childrenAtDepth.index;

        for (let i = 0; i < index; i++)
        {
            const child = list[i];

            // check that these things match our layer and depth - if the renderGroup does not match,
            // the child has been re-parented into another rendergroup since it asked to be updated so we can ignore it here
            // secondly if the relativeRenderGroupDepth has changed, then the it means it will have been nested at a
            // different different level in the render group - so we can wait for the update that does in fact match
            if (child.parentRenderGroup === renderGroup && child.relativeRenderGroupDepth === renderGroupDepth)
            {
                updateTransformAndChildren(child, updateTick, 0);
            }
        }

        clearList(list, index);

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

/**
 * @param renderGroup
 * @internal
 */
export function updateRenderGroupTransform(renderGroup: RenderGroup)
{
    const root = renderGroup.root;

    const { renderGroupParent, _sceneState } = renderGroup;

    renderGroup.invalidateMatrices();

    // out of a render, this puts it back where it is in the scene graph
    if (renderPass.id) updatePassState(renderGroup);
    else renderGroup._sceneTransform = null;

    if (renderPass.view)
    {
        _sceneState.copyFrom(renderGroup._passState);
    }
    else if (renderGroup._sceneTransform)
    {
        _sceneState.set(renderGroup._sceneTransform, root.localColor, root.localAlpha);
    }
    else if (renderGroupParent)
    {
        _sceneState.set(root.relativeGroupTransform, root.groupColor, root.groupAlpha, renderGroupParent._sceneState);
    }
    else
    {
        _sceneState.set(root.localTransform, root.localColor, root.localAlpha);
    }
}

function updatePassState(renderGroup: RenderGroup): void
{
    const { root, renderGroupParent, _passState } = renderGroup;
    const { id, transform, view } = renderPass;

    renderGroup._passId = id;
    renderGroup._isPlaced = true;

    if (renderGroup === renderPass.root)
    {
        _passState.set(transform, root.localColor, root.localAlpha);

        // rendering to a texture does not move what is in a scene, or on the view
        if (view || !(renderGroupParent?._isPlaced || renderGroup._isOnView))
        {
            const isWhereItIs = !root.parent && transform === root.localTransform;

            renderGroup._sceneTransform = isWhereItIs ? null : transform.clone();
        }

        if (view)
        {
            renderGroup._view = view;
            renderGroup._viewFrame = view.frame;
        }

        return;
    }

    if (renderGroupParent)
    {
        // onRender can move this to a parent that is not being rendered, or is part of another render
        const parentState = renderGroupParent._passId === id ? renderGroupParent._passState : renderGroupParent._sceneState;

        _passState.set(root.relativeGroupTransform, root.groupColor, root.groupAlpha, parentState);
    }
    else
    {
        _passState.set(root.localTransform, root.localColor, root.localAlpha);
    }

    // now part of the scene being drawn, unless it is on the view by itself
    if (view || !renderGroup._isOnView)
    {
        renderGroup._sceneTransform = null;
        renderGroup._view = null;
    }
}

/**
 * @param container
 * @param updateTick
 * @param updateFlags
 * @internal
 */
export function updateTransformAndChildren(container: Container, updateTick: number, updateFlags: number)
{
    if (updateTick === container.updateTick) return;
    container.updateTick = updateTick;

    container.didChange = false;

    const localTransform = container.localTransform;

    container.updateLocalTransform();

    const parent = container.parent;

    if ((parent && !parent.renderGroup))
    {
        updateFlags |= container._updateFlags;

        container.relativeGroupTransform.appendFrom(
            localTransform,
            parent.relativeGroupTransform,
        );

        if (updateFlags & UPDATE_BLEND_COLOR_VISIBLE)
        {
            updateColorBlendVisibility(container, parent, updateFlags);
        }
    }
    else
    {
        updateFlags = container._updateFlags;

        container.relativeGroupTransform.copyFrom(localTransform);

        if (updateFlags & UPDATE_BLEND_COLOR_VISIBLE)
        {
            updateColorBlendVisibility(container, tempContainer, updateFlags);
        }
    }

    // don't update children if its a layer..
    if (!container.renderGroup)
    {
        const children = container.children;
        const length = children.length;

        for (let i = 0; i < length; i++)
        {
            updateTransformAndChildren(children[i], updateTick, updateFlags);
        }

        const renderGroup = container.parentRenderGroup;
        const renderable = container as ViewContainer;

        if (renderable.renderPipeId && !renderGroup.structureDidChange)
        {
            renderGroup.updateRenderable(renderable);
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
        container.groupColor = multiplyColors(
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
        container.globalDisplayStatus = container.localDisplayStatus & parent.globalDisplayStatus;
    }

    container._updateFlags = 0;
}

