import { ExtensionType } from '../../extensions/Extensions';
import { Matrix } from '../../maths/matrix/Matrix';
import { TexturePool } from '../../rendering/renderers/shared/texture/TexturePool';
import { Bounds } from './bounds/Bounds';
import { clearList } from './utils/clearList';
import { executeInstructions } from './utils/executeInstructions';
import { updateRenderGroupTransforms } from './utils/updateRenderGroupTransforms';
import { validateRenderables } from './utils/validateRenderables';

import type { WebGPURenderer } from '../../rendering/renderers/gpu/WebGPURenderer';
import type { System } from '../../rendering/renderers/shared/system/System';
import type { Renderer, RenderPipes } from '../../rendering/renderers/types';
import type { ViewContainer } from '../view/ViewContainer';
import type { Container } from './Container';
import type { RenderGroup } from './RenderGroup';

const tempMatrix = new Matrix();

/**
 * The view system manages the main canvas that is attached to the DOM.
 * This main role is to deal with how the holding the view reference and dealing with how it is resized.
 * @memberof rendering
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

    protected render({ container, transform }: {container: Container, transform: Matrix}): void
    {
        // we need to save the parent and renderGroupParent, so we can restore them later
        const parent = container.parent;
        const renderGroupParent = container.renderGroup.renderGroupParent;

        // we set the transforms and parents to null, so we can render the container without any transforms
        container.parent = null;
        container.renderGroup.renderGroupParent = null;

        const renderer = this._renderer;

        // collect all the renderGroups in the scene and then render them one by one..
        let originalLocalTransform: Matrix = tempMatrix;

        if (transform)
        {
            originalLocalTransform = originalLocalTransform.copyFrom(container.renderGroup.localTransform);
            container.renderGroup.localTransform.copyFrom(transform);
        }

        //  this._assignTop(container.renderGroup, null);
        const renderPipes = (renderer as WebGPURenderer).renderPipes;

        this._updateCachedRenderGroups(container.renderGroup, null);

        this._updateRenderGroups(container.renderGroup);

        renderer.globalUniforms.start({
            worldTransformMatrix: transform ? container.renderGroup.localTransform : container.renderGroup.worldTransform,
            worldColor: container.renderGroup.worldColorAlpha,
        });

        executeInstructions(container.renderGroup, renderPipes);

        // TODO need to add some events / runners for things like this to hook up to
        if (renderPipes.uniformBatch)
        {
            renderPipes.uniformBatch.renderEnd();
        }

        // now return the transforms back to normal..
        if (transform)
        {
            container.renderGroup.localTransform.copyFrom(originalLocalTransform);
        }

        container.parent = parent;
        container.renderGroup.renderGroupParent = renderGroupParent;
    }

    public destroy()
    {
        (this._renderer as null) = null;
    }

    private _updateCachedRenderGroups(renderGroup: RenderGroup, closestCacheAsTexture: RenderGroup | null): void
    {
        if (renderGroup.isCachedAsTexture)
        {
            // early out as nothing further needs to be updated!
            if (!renderGroup.updateCacheTexture) return;

            closestCacheAsTexture = renderGroup;
        }

        renderGroup._parentCacheAsTextureRenderGroup = closestCacheAsTexture;

        // now check the cacheAsTexture stuff...
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

                bounds.ceil();

                const lastTexture = renderGroup.texture;

                if (renderGroup.texture)
                {
                    TexturePool.returnTexture(renderGroup.texture);
                }

                const renderer = this._renderer;
                const resolution = renderGroup.textureOptions.resolution || renderer.view.resolution;
                const antialias = renderGroup.textureOptions.antialias ?? renderer.view.antialias;

                renderGroup.texture = TexturePool.getOptimalTexture(
                    bounds.width,
                    bounds.height,
                    resolution,
                    antialias
                );

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

        renderGroup.runOnRender();

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
        if (renderGroup.isCachedAsTexture && !renderGroup.textureNeedsUpdate) return;

        for (let i = 0; i < renderGroup.renderGroupChildren.length; i++)
        {
            this._updateRenderGroups(renderGroup.renderGroupChildren[i]);
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

