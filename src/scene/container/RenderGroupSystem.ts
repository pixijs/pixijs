import { ExtensionType } from '../../extensions/Extensions';
import { TexturePool } from '../../rendering/renderers/shared/texture/TexturePool';
import { Bounds } from './bounds/Bounds';
import { runRenderPass } from './renderPass';
import { clearList } from './utils/clearList';
import { executeInstructions } from './utils/executeInstructions';
import { updateRenderGroupTransform, updateRenderGroupTransforms } from './utils/updateRenderGroupTransforms';
import { validateRenderables } from './utils/validateRenderables';

import type { WebGPURenderer } from '../../rendering/renderers/gpu/WebGPURenderer';
import type { RenderOptions } from '../../rendering/renderers/shared/system/AbstractRenderer';
import type { System } from '../../rendering/renderers/shared/system/System';
import type { Renderer, RenderPipes } from '../../rendering/renderers/types';
import type { ViewContainer } from '../view/ViewContainer';
import type { RenderGroup } from './RenderGroup';

/**
 * The view system manages the main canvas that is attached to the DOM.
 * This main role is to deal with how the holding the view reference and dealing with how it is resized.
 * @category rendering
 * @internal
 */
export class RenderGroupSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'renderGroup',
    } as const;

    private readonly _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    protected render({ container, transform }: RenderOptions): void
    {
        const { renderGroup, localTransform } = container;
        // its own transform stays live for onRender to move; one passed in is often shared, so it is copied
        const passTransform = transform === localTransform ? transform : transform.clone();

        runRenderPass(renderGroup, passTransform, this._renderer._passView, () => this._render(renderGroup));
    }

    public destroy()
    {
        (this._renderer as null) = null;
    }

    private _render(renderGroup: RenderGroup): void
    {
        const renderer = this._renderer;
        const renderPipes = (renderer as WebGPURenderer).renderPipes;

        this._updateCachedRenderGroups(renderGroup, null);

        this._updateRenderGroups(renderGroup);

        renderer.globalUniforms.start({
            worldTransformMatrix: renderGroup.worldTransform,
            worldColor: renderGroup.worldColorAlpha,
        });

        executeInstructions(renderGroup, renderPipes);

        // TODO need to add some events / runners for things like this to hook up to
        if (renderPipes.uniformBatch)
        {
            renderPipes.uniformBatch.renderEnd();
        }
    }

    private _updateCachedRenderGroups(renderGroup: RenderGroup, closestCacheAsTexture: RenderGroup | null): void
    {
        renderGroup._parentCacheAsTextureRenderGroup = closestCacheAsTexture;

        if (renderGroup._isDrawnAsTexture)
        {
            // Early out as nothing further needs to be updated!
            if (!renderGroup.textureNeedsUpdate) return;

            closestCacheAsTexture = renderGroup;
        }

        // Update the closest cache reference for children if this render group is cached as texture
        for (let i = renderGroup.renderGroupChildren.length - 1; i >= 0; i--)
        {
            this._updateCachedRenderGroups(renderGroup.renderGroupChildren[i], closestCacheAsTexture);
        }

        renderGroup.invalidateMatrices();

        if (renderGroup.isCachedAsTexture)
        {
            if (renderGroup.textureNeedsUpdate)
            {
                // lets get the texture ready for rendering
                // but the rendering will not happen until the renderGroup is rendered!
                // We also want to know now, what the bounds of the texture will be.
                // as if the texture changes, we need to invalidate the parent render group!
                const bounds = renderGroup.root.getLocalBounds();
                const renderer = this._renderer;
                const resolution = renderGroup.textureOptions.resolution || renderer.view.resolution;
                const antialias = renderGroup.textureOptions.antialias ?? renderer.view.antialias;
                const scaleMode = renderGroup.textureOptions.scaleMode ?? 'linear';
                const lastTexture = renderGroup.texture;

                bounds.ceil();

                if (renderGroup.texture)
                {
                    TexturePool.returnTexture(renderGroup.texture);
                }

                const texture = TexturePool.getOptimalTexture({
                    width: bounds.width,
                    height: bounds.height,
                    resolution,
                    antialias,
                    scaleMode,
                });

                renderGroup.texture = texture;
                renderGroup._textureBounds ||= new Bounds();
                renderGroup._textureBounds.copyFrom(bounds);

                if (lastTexture !== renderGroup.texture)
                {
                    if (renderGroup.renderGroupParent)
                    {
                        renderGroup.renderGroupParent.structureDidChange = true;
                    }
                }
            }
        }
        else if (renderGroup.texture)
        {
            TexturePool.returnTexture(renderGroup.texture);
            renderGroup.texture = null;
        }
    }

    private _updateRenderGroups(renderGroup: RenderGroup): void
    {
        const renderer = this._renderer;
        const renderPipes = renderer.renderPipes;

        renderGroup.runOnRender(renderer);

        renderGroup.instructionSet.renderPipes = renderPipes;

        if (!renderGroup.structureDidChange)
        {
            // phase 1 - validate all the renderables
            validateRenderables(renderGroup, renderPipes);
        }
        else
        {
            clearList(renderGroup.childrenRenderablesToUpdate.list, 0);
        }

        // phase 2 - update all the transforms
        // including updating the renderables..
        updateRenderGroupTransforms(renderGroup);

        if (renderGroup.structureDidChange)
        {
            renderGroup.structureDidChange = false;

            // build the renderables
            this._buildInstructions(renderGroup, renderer);
        }
        else
        {
            // update remaining renderables
            this._updateRenderables(renderGroup);
        }

        // reset the renderables to update
        renderGroup.childrenRenderablesToUpdate.index = 0;

        // upload all the things!
        renderer.renderPipes.batch.upload(renderGroup.instructionSet);

        // early out if it's a texture and it hasn't changed!
        if (renderGroup._isDrawnAsTexture && !renderGroup.textureNeedsUpdate)
        {
            // the groups inside are not drawn, but they still move with it
            this._updateChildTransforms(renderGroup, renderGroup);

            return;
        }

        for (let i = 0; i < renderGroup.renderGroupChildren.length; i++)
        {
            this._updateRenderGroups(renderGroup.renderGroupChildren[i]);
        }
    }

    private _updateChildTransforms(renderGroup: RenderGroup, closestCacheAsTexture: RenderGroup): void
    {
        for (let i = 0; i < renderGroup.renderGroupChildren.length; i++)
        {
            const child = renderGroup.renderGroupChildren[i];

            // rendering the cached container by itself clears this
            child._parentCacheAsTextureRenderGroup = closestCacheAsTexture;

            updateRenderGroupTransform(child);
            this._updateChildTransforms(child, child.isCachedAsTexture ? child : closestCacheAsTexture);
        }
    }

    private _updateRenderables(renderGroup: RenderGroup)
    {
        const { list, index } = renderGroup.childrenRenderablesToUpdate;

        for (let i = 0; i < index; i++)
        {
            const container = list[i];

            if (container.didViewUpdate)
            {
                renderGroup.updateRenderable(container as ViewContainer);
            }
        }

        clearList(list, index);
    }

    /**
     * @param renderGroup
     * @param renderPipes
     * @deprecated since 8.3.0
     */
    private _buildInstructions(renderGroup: RenderGroup, renderPipes: RenderPipes): void;
    private _buildInstructions(renderGroup: RenderGroup, renderer: Renderer): void;
    private _buildInstructions(renderGroup: RenderGroup, rendererOrPipes: RenderPipes | Renderer): void
    {
    // rebuild the scene graph based on layers...
        const root = renderGroup.root;
        const instructionSet = renderGroup.instructionSet;

        instructionSet.reset();

        // deprecate the use of renderPipes by finding the renderer attached to the batch pipe as this is always there
        const renderer = (rendererOrPipes as Renderer).renderPipes
            ? (rendererOrPipes as Renderer)
            : (rendererOrPipes as RenderPipes).batch.renderer;
        const renderPipes = renderer.renderPipes;

        // TODO add some events / runners for build start
        renderPipes.batch.buildStart(instructionSet);
        renderPipes.blendMode.buildStart();
        renderPipes.colorMask.buildStart();

        if (root.sortableChildren)
        {
            root.sortChildren();
        }

        root.collectRenderablesWithEffects(instructionSet, renderer, null);

        // TODO add some events / runners for build end
        renderPipes.batch.buildEnd(instructionSet);
        renderPipes.blendMode.buildEnd(instructionSet);
    }
}

