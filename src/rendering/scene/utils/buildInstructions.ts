import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { SharedPipes } from '../../renderers/shared/system/SharedSystems';
import type { Renderer } from '../../renderers/types';
import type { Container } from '../Container';
import type { LayerGroup } from '../LayerGroup';

export function buildInstructions(layerGroup: LayerGroup, renderPipes: Renderer['renderPipes'])
{
    const root = layerGroup.root;
    const instructionSet = layerGroup.instructionSet;

    instructionSet.reset();

    // TODO add some events / runners for build start
    renderPipes.batch.buildStart(instructionSet);
    renderPipes.blendMode.buildStart();
    renderPipes.colorMask.buildStart();

    const proxyRenderable = layerGroup.proxyRenderable;

    if (proxyRenderable)
    {
        renderPipes.blendMode.setBlendMode(proxyRenderable, proxyRenderable.layerBlendMode, instructionSet);

        (renderPipes as SharedPipes<any>)[proxyRenderable.view.type].addRenderable(proxyRenderable, instructionSet);
    }

    const children = root.children;

    const length = children.length;

    for (let i = 0; i < length; i++)
    {
        collectAllRenderables(children[i], instructionSet, renderPipes);
    }

    // TODO add some events / runners for build end
    renderPipes.batch.buildEnd(instructionSet);
    renderPipes.blendMode.buildEnd(instructionSet);
}

export function collectAllRenderables(
    container: Container,
    instructionSet: InstructionSet,
    rendererPipes: Renderer['renderPipes']
): void
{
    // if there is 0b01 or 0b10 the return value

    if (container.layerVisibleRenderable < 0b11 || !container.includeInBuild) return;

    if (container.isSimple)
    {
        collectAllRenderablesSimple(container, instructionSet, rendererPipes);
    }
    else
    {
        collectAllRenderablesAdvanced(container, instructionSet, rendererPipes);
    }
}

function collectAllRenderablesSimple(
    container: Container,
    instructionSet: InstructionSet,
    renderPipes: Renderer['renderPipes']
): void
{
    const view = container.view;

    if (view)
    {
        // TODO add blends in
        renderPipes.blendMode.setBlendMode(container as Renderable, container.layerBlendMode, instructionSet);

        container.didViewUpdate = false;

        const rp = renderPipes as unknown as Record<string, RenderPipe>;

        rp[view.type].addRenderable(container, instructionSet);
    }

    if (!container.isLayerRoot)
    {
        const children = container.children;
        const length = children.length;

        for (let i = 0; i < length; i++)
        {
            collectAllRenderables(children[i], instructionSet, renderPipes);
        }
    }
}

function collectAllRenderablesAdvanced(
    container: Container,
    instructionSet: InstructionSet,
    renderPipes: Renderer['renderPipes']
): void
{
    for (let i = 0; i < container.effects.length; i++)
    {
        const effect = container.effects[i];

        (renderPipes as SharedPipes<any>)[effect.pipe].push(effect, container, instructionSet);
    }

    if (container.isLayerRoot)
    {
        renderPipes.layer.addLayerGroup(container.layerGroup, instructionSet);
    }
    else
    {
        const view = container.view;

        if (view)
        {
            // TODO add blends in
            renderPipes.blendMode.setBlendMode(container as Renderable, container.layerBlendMode, instructionSet);

            container.didViewUpdate = false;

            (renderPipes as SharedPipes<any>)[view.type].addRenderable(container, instructionSet);
        }

        const children = container.children;

        if (children.length)
        {
            for (let i = 0; i < children.length; i++)
            {
                collectAllRenderables(children[i], instructionSet, renderPipes);
            }
        }
    }

    // loop backwards through effects
    for (let i = container.effects.length - 1; i >= 0; i--)
    {
        const effect = container.effects[i];

        (renderPipes as SharedPipes<any>)[effect.pipe].pop(effect, container, instructionSet);
    }
}
