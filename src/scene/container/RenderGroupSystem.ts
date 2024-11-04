import { ExtensionType } from '../../extensions/Extensions';
import { Matrix } from '../../maths/matrix/Matrix';
import { TexturePool } from '../../rendering/renderers/shared/texture/TexturePool';
import { Bounds } from './bounds/Bounds';
import { buildInstructions } from './utils/buildInstructions';
import { clearList } from './utils/clearList';
import { executeInstructions } from './utils/executeInstructions';
import { updateRenderGroupTransforms } from './utils/updateRenderGroupTransforms';
import { validateRenderables } from './utils/validateRenderables';

import type { WebGPURenderer } from '../../rendering/renderers/gpu/WebGPURenderer';
import type { RenderOptions } from '../../rendering/renderers/shared/system/AbstractRenderer';
import type { System } from '../../rendering/renderers/shared/system/System';
import type { Renderer } from '../../rendering/renderers/types';
import type { ViewContainer } from '../view/ViewContainer';
import type { Container } from './Container';
import type { RenderGroup } from './RenderGroup';

const tempMatrix = new Matrix();
const tempMatrix2 = new Matrix();

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

    public prerender(options: RenderOptions): void
    {
        /**
         * the way cached render textures work is that we need to to do a pass
         * across all the renderGroups to check if they are should be rerendered if
         * they are a cached texture.
         */
        this._updateCachedRenderTextures(options.container.renderGroup);
    }

    protected render({ container, transform }: {container: Container, transform: Matrix}): void
    {
        const parent = container.parent;
        const renderGroupParent = container.renderGroup.renderGroupParent;

        container.parent = null;
        container.renderGroup.renderGroupParent = null;

        const renderer = this._renderer;

        // collect all the renderGroups in the scene and then render them one by one..
        const renderGroups = this._collectRenderGroups(container.renderGroup, []);

        let originalLocalTransform: Matrix = tempMatrix;

        if (transform)
        {
            originalLocalTransform = originalLocalTransform.copyFrom(container.renderGroup.localTransform);
            container.renderGroup.localTransform.copyFrom(transform);
        }

        const renderPipes = (renderer as WebGPURenderer).renderPipes;

        for (let i = 0; i < renderGroups.length; i++)
        {
            const renderGroup = renderGroups[i];

            renderGroup.textureNeedsUpdate = false;

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
                buildInstructions(renderGroup, renderer);
            }
            else
            {
                // update remaining renderables
                updateRenderables(renderGroup);
            }

            // reset the renderables to update
            renderGroup.childrenRenderablesToUpdate.index = 0;

            // upload all the things!
            renderer.renderPipes.batch.upload(renderGroup.instructionSet);
        }

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

    private _updateCachedRenderTextures(renderGroup: RenderGroup): void
    {
        const renderer = this._renderer;

        for (let i = 0; i < renderGroup.renderGroupChildren.length; i++)
        {
            const childRenderGroup = renderGroup.renderGroupChildren[i];

            this._updateCachedRenderTextures(childRenderGroup);

            if (childRenderGroup.cacheAsTexture)
            {
                if (childRenderGroup.textureNeedsUpdate)
                {
                    const bounds = childRenderGroup.root.getLocalBounds();

                    bounds.ceil();

                    const lastTexture = childRenderGroup.texture;

                    if (childRenderGroup.texture)
                    {
                        TexturePool.returnTexture(childRenderGroup.texture);
                    }

                    const resolution = childRenderGroup.textureOptions.resolution || renderer.view.resolution;
                    const antialias = childRenderGroup.textureOptions.antialias ?? renderer.view.antialias;

                    childRenderGroup.texture = TexturePool.getOptimalTexture(
                        bounds.width,
                        bounds.height,
                        resolution,
                        antialias
                    );

                    childRenderGroup.textureBounds ||= new Bounds();

                    childRenderGroup.textureBounds.copyFrom(bounds);

                    if (lastTexture !== childRenderGroup.texture)
                    {
                        if (childRenderGroup.renderGroupParent)
                        {
                            childRenderGroup.renderGroupParent.structureDidChange = true;
                        }
                    }

                    const transform = tempMatrix2;

                    transform.tx = -bounds.x;
                    transform.ty = -bounds.y;

                    renderer.renderContainer({
                        container: childRenderGroup.root,
                        target: childRenderGroup.texture,
                        transform,
                        clear: true
                    });
                }
            }
            else if (childRenderGroup.texture)
            {
                TexturePool.returnTexture(childRenderGroup.texture);
            }
        }
    }

    private _collectRenderGroups(renderGroup: RenderGroup, out: RenderGroup[] = [])
    {
        out.push(renderGroup);

        if (renderGroup.cacheAsTexture && !renderGroup.textureNeedsUpdate)
        {
            // no need to update anything if it's a texture and it hasn't changed!
            return out;
        }

        for (let i = 0; i < renderGroup.renderGroupChildren.length; i++)
        {
            this._collectRenderGroups(renderGroup.renderGroupChildren[i], out);
        }

        return out;
    }
}

function updateRenderables(renderGroup: RenderGroup)
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

