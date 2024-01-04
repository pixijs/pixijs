import { ExtensionType } from '../../extensions/Extensions';
import { buildInstructions } from './utils/buildInstructions';
import { collectRenderGroups } from './utils/collectRenderGroups';
import { executeInstructions } from './utils/executeInstructions';
import { updateRenderGroupTransforms } from './utils/updateRenderGroupTransforms';
import { validateRenderables } from './utils/validateRenderables';

import type { Matrix } from '../../maths/matrix/Matrix';
import type { WebGPURenderer } from '../../rendering/renderers/gpu/WebGPURenderer';
import type { System } from '../../rendering/renderers/shared/system/System';
import type { Renderer } from '../../rendering/renderers/types';
import type { Container } from './Container';
import type { RenderGroup } from './RenderGroup';

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
        container.isRenderGroup = true;

        const parent = container.parent;

        container.parent = null;
        const renderer = this._renderer;

        // collect all the renderGroups in the scene and then render them one by one..
        const renderGroups = collectRenderGroups(container.renderGroup, []);

        if (transform)
        {
            container.renderGroup.localTransform.copyFrom(transform);
        }

        const renderPipes = (renderer as WebGPURenderer).renderPipes;

        for (let i = 0; i < renderGroups.length; i++)
        {
            const renderGroup = renderGroups[i];

            renderGroup.runOnRender();

            renderGroup.instructionSet.renderPipes = renderPipes;

            if (!renderGroup.structureDidChange)
            {
                // phase 1 - validate all the renderables
                validateRenderables(renderGroup, renderPipes);
            }

            // phase 2 - update all the transforms
            // including updating the renderables..
            updateRenderGroupTransforms(renderGroup);

            if (renderGroup.structureDidChange)
            {
                renderGroup.structureDidChange = false;

                // build the renderables
                buildInstructions(renderGroup, renderPipes);
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
            worldTransformMatrix: transform ? container.renderGroup.localTransform : container.renderGroup.worldTransform
        });

        executeInstructions(container.renderGroup, renderPipes);

        // TODO need to add some events / runners for things like this to hook up to
        if (renderPipes.uniformBatch)
        {
            renderPipes.uniformBatch.renderEnd();
        }

        container.parent = parent;
    }

    public destroy()
    {
        (this._renderer as null) = null;
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
            renderGroup.updateRenderable(container);
        }
    }
}

