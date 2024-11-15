import { warn } from '../../../utils/logging/warn';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { InstructionPipe, RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../../rendering/renderers/shared/Renderable';
import type { Renderer, RenderPipes } from '../../../rendering/renderers/types';
import type { RenderLayer } from '../../layers/RenderLayer';
import type { Container } from '../Container';
import type { RenderGroup } from '../RenderGroup';

/**
 * @param renderGroup
 * @param renderPipes
 * @deprecated since 8.3.0
 */
export function buildInstructions(renderGroup: RenderGroup, renderPipes: RenderPipes): void;
export function buildInstructions(renderGroup: RenderGroup, renderer: Renderer): void;
export function buildInstructions(renderGroup: RenderGroup, rendererOrPipes: RenderPipes | Renderer): void
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

    collectAllRenderablesAdvanced(root, instructionSet, renderer, null, true);

    // TODO add some events / runners for build end
    renderPipes.batch.buildEnd(instructionSet);
    renderPipes.blendMode.buildEnd(instructionSet);
}

/**
 * @param container
 * @param instructionSet
 * @param renderer
 * @param currentLayer
 */
export function collectAllRenderables(
    container: Container, instructionSet: InstructionSet, renderer: Renderer, currentLayer: RenderLayer
): void
{
    // deprecate the use of renderPipes by finding the renderer attached to the batch pipe as this is always there
    if (container.isLayer)
    {
        const layer = container as RenderLayer;

        currentLayer = layer;

        for (let i = 0; i < layer.layerChildren.length; i++)
        {
            if (!layer.layerChildren[i].parent)
            {
                // eslint-disable-next-line max-len
                warn('Container must be added to both layer and scene graph. Layers only handle render order - the scene graph is required for transforms (addChild)',
                    layer.layerChildren[i]);
            }

            collectAllRenderables(layer.layerChildren[i], instructionSet, renderer, currentLayer);
        }

        return;
    }

    // we want to skip any children that are not in the current layer
    if ((container.parentRenderLayer && container.parentRenderLayer !== currentLayer)
        // if there is 0b01 or 0b10 the return value
        || container.globalDisplayStatus < 0b111 || !container.includeInBuild) return;

    if (container.sortableChildren)
    {
        container.sortChildren();
    }

    if (container.isSimple)
    {
        collectAllRenderablesSimple(container, instructionSet, renderer, currentLayer);
    }
    else
    {
        collectAllRenderablesAdvanced(container, instructionSet, renderer, currentLayer, false);
    }
}

function collectAllRenderablesSimple(
    container: Container,
    instructionSet: InstructionSet,
    renderer: Renderer,
    currentLayer: RenderLayer,
): void
{
    if (container.renderPipeId)
    {
        const renderable = container as Renderable;
        const { renderPipes, renderableGC } = renderer;

        // TODO add blends in
        renderPipes.blendMode.setBlendMode(renderable, container.groupBlendMode, instructionSet);

        const rp = renderPipes as unknown as Record<string, RenderPipe>;

        rp[renderable.renderPipeId].addRenderable(renderable, instructionSet);

        renderableGC.addRenderable(renderable, instructionSet);

        renderable.didViewUpdate = false;
    }

    if (!container.renderGroup)
    {
        const children = container.children;
        const length = children.length;

        for (let i = 0; i < length; i++)
        {
            collectAllRenderables(children[i], instructionSet, renderer, currentLayer);
        }
    }
}

function collectAllRenderablesAdvanced(
    container: Container,
    instructionSet: InstructionSet,
    renderer: Renderer,
    currentLayer: RenderLayer,
    isRoot: boolean,
): void
{
    const { renderPipes, renderableGC } = renderer;

    if (!isRoot && container.renderGroup)
    {
        renderPipes.renderGroup.addRenderGroup(container.renderGroup, instructionSet);
    }
    else
    {
        for (let i = 0; i < container.effects.length; i++)
        {
            const effect = container.effects[i];
            const pipe = renderPipes[effect.pipe as keyof RenderPipes]as InstructionPipe<any>;

            pipe.push(effect, container, instructionSet);
        }

        const renderable = container as Renderable;
        const renderPipeId = renderable.renderPipeId;

        if (renderPipeId)
        {
            // TODO add blends in
            renderPipes.blendMode.setBlendMode(renderable, renderable.groupBlendMode, instructionSet);

            const pipe = renderPipes[renderPipeId as keyof RenderPipes]as RenderPipe<any>;

            pipe.addRenderable(renderable, instructionSet);

            renderableGC.addRenderable(renderable, instructionSet);

            renderable.didViewUpdate = false;
        }

        const children = container.children;

        if (children.length)
        {
            for (let i = 0; i < children.length; i++)
            {
                collectAllRenderables(children[i], instructionSet, renderer, currentLayer);
            }
        }

        // loop backwards through effects
        for (let i = container.effects.length - 1; i >= 0; i--)
        {
            const effect = container.effects[i];
            const pipe = renderPipes[effect.pipe as keyof RenderPipes]as InstructionPipe<any>;

            pipe.pop(effect, container, instructionSet);
        }
    }
}
