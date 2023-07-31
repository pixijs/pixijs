import { ExtensionType } from '../../extensions/Extensions';
import { buildInstructions } from './utils/buildInstructions';
import { collectLayerGroups } from './utils/collectLayerGroups';
import { executeInstructions } from './utils/executeInstructions';
import { updateLayerGroupTransforms } from './utils/updateLayerGroupTransforms';
import { validateRenderables } from './utils/validateRenderables';

import type { WebGPURenderer } from '../renderers/gpu/WebGPURenderer';
import type { System } from '../renderers/shared/system/System';
import type { Renderer } from '../renderers/types';
import type { Container } from './Container';
import type { LayerGroup } from './LayerGroup';

/**
 * The view system manages the main canvas that is attached to the DOM.
 * This main role is to deal with how the holding the view reference and dealing with how it is resized.
 * @memberof PIXI
 */

export class LayerSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'layer',
    } as const;

    private readonly _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    protected render({ container }: {container: Container}): void
    {
        container.layer = true;

        const renderer = this._renderer;

        // collect all the renderGroups in the scene and then render them one by one..
        const layerGroups = collectLayerGroups(container.layerGroup, []);

        const renderPipes = (renderer as WebGPURenderer).renderPipes;

        for (let i = 0; i < layerGroups.length; i++)
        {
            const layerGroup = layerGroups[i];

            layerGroup.runOnRender();

            layerGroup.instructionSet.renderPipes = renderPipes;

            if (!layerGroup.structureDidChange)
            {
                // phase 1 - validate all the renderables
                validateRenderables(layerGroup, renderPipes);
            }

            // phase 2 - update all the transforms
            // including updating the renderables..
            updateLayerGroupTransforms(layerGroup);

            if (layerGroup.structureDidChange)
            {
                layerGroup.structureDidChange = false;

                // build the renderables
                buildInstructions(layerGroup, renderPipes);
            }
            else
            {
                // update remaining renderables
                updateThings(layerGroup);
            }

            // upload all the things!
            renderer.renderPipes.batch.upload(layerGroup.instructionSet);
        }

        renderer.globalUniforms.start(
            {
                projectionMatrix: renderer.renderTarget.rootProjectionMatrix,
                worldTransformMatrix: container.layerGroup.worldTransform
            }
        );

        executeInstructions(container.layerGroup, renderPipes);

        // TODO need to add some events / runners for things like this to hook up to
        if (renderPipes.uniformBatch)
        {
            renderPipes.uniformBatch.renderEnd();
            renderPipes.uniformBuffer.renderEnd();
        }
    }

    public destroy()
    {
        // boom!
    }
}

function updateThings(layerGroup: LayerGroup)
{
    const { list, index } = layerGroup.childrenRenderablesToUpdate;

    for (let i = 0; i < index; i++)
    {
        const container = list[i];

        if (container.didViewUpdate)
        {
            layerGroup.updateRenderable(container);
        }
    }

    layerGroup.childrenRenderablesToUpdate.index = 0;
}

