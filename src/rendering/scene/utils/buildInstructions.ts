import { LayerRenderable } from '../../renderers/shared/LayerRenderable';

import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe, RenderPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { RenderPipes } from '../../renderers/types';
import type { Container } from '../Container';
import type { LayerGroup } from '../LayerGroup';

export function buildInstructions(layerGroup: LayerGroup, renderPipes: RenderPipes)
{
    const root = layerGroup.root;
    const instructionSet = layerGroup.instructionSet;

    instructionSet.reset();

    // TODO add some events / runners for build start
    renderPipes.batch.buildStart(instructionSet);
    renderPipes.blendMode.buildStart();
    renderPipes.colorMask.buildStart();

    if (root.sortableChildren)
    {
        root.sortChildren();
    }

    collectAllRenderablesAdvanced(root, instructionSet, renderPipes, true);

    // instructionSet.log();
    // TODO add some events / runners for build end
    renderPipes.batch.buildEnd(instructionSet);
    renderPipes.blendMode.buildEnd(instructionSet);

    // instructionSet.log();
}

export function collectAllRenderables(
    container: Container,
    instructionSet: InstructionSet,
    rendererPipes: RenderPipes
): void
{
    // if there is 0b01 or 0b10 the return value

    if (container.layerVisibleRenderable < 0b11 || !container.includeInBuild) return;

    if (container.sortableChildren)
    {
        container.sortChildren();
    }

    if (container.isSimple)
    {
        collectAllRenderablesSimple(container, instructionSet, rendererPipes);
    }
    else
    {
        collectAllRenderablesAdvanced(container, instructionSet, rendererPipes, false);
    }
}

function collectAllRenderablesSimple(
    container: Container,
    instructionSet: InstructionSet,
    renderPipes: RenderPipes
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
    renderPipes: RenderPipes,
    isRoot: boolean
): void
{
    if (isRoot)
    {
        const layerGroup = container.layerGroup;

        if (layerGroup.root.view)
        {
            // proxy renderable is needed here as we do not want to inherit the transform / color of the root container
            const proxyRenderable = layerGroup.proxyRenderable ?? initProxyRenderable(layerGroup);

            if (proxyRenderable)
            {
                renderPipes.blendMode.setBlendMode(proxyRenderable, proxyRenderable.layerBlendMode, instructionSet);

                // eslint-disable-next-line max-len
                (renderPipes[proxyRenderable.view.type as keyof RenderPipes] as any).addRenderable(proxyRenderable, instructionSet);
            }
        }
    }
    else
    {
        for (let i = 0; i < container.effects.length; i++)
        {
            const effect = container.effects[i];
            const pipe = renderPipes[effect.pipe as keyof RenderPipes]as InstructionPipe<any>;

            pipe.push(effect, container, instructionSet);
        }
    }

    if (!isRoot && container.isLayerRoot)
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

            const pipe = renderPipes[view.type as keyof RenderPipes]as RenderPipe<any>;

            pipe.addRenderable(container, instructionSet);
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

    if (!isRoot)
    {
        // loop backwards through effects
        for (let i = container.effects.length - 1; i >= 0; i--)
        {
            const effect = container.effects[i];
            const pipe = renderPipes[effect.pipe as keyof RenderPipes]as InstructionPipe<any>;

            pipe.pop(effect, container, instructionSet);
        }
    }
}

function initProxyRenderable(layerGroup: LayerGroup)
{
    const root = layerGroup.root;

    layerGroup.proxyRenderable = new LayerRenderable({
        original: root,
        view: root.view,
    });
}
