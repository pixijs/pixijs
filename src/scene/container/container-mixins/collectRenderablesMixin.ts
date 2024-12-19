import { type InstructionSet } from '~/rendering/renderers/shared/instructions/InstructionSet';
import { type InstructionPipe } from '~/rendering/renderers/shared/instructions/RenderPipe';
import { type Renderer, type RenderPipes } from '~/rendering/renderers/types';
import { type IRenderLayer } from '~/scene/layers/RenderLayer';

import type { Container } from '../Container';

export interface CollectRenderablesMixin
{
    /**
     * Collects all renderables from the container and its children, and adds them to the instruction set.
     * This method determines whether to use a simple or advanced collection method based on the container's properties.
     * @param {InstructionSet} instructionSet - The set of instructions to which the renderables will be added.
     * @param {Renderer} renderer - The renderer responsible for rendering the scene.
     * @param {IRenderLayer} currentLayer - The current render layer being processed.
     */
    collectRenderables(instructionSet: InstructionSet, renderer: Renderer, currentLayer: IRenderLayer): void;

    /**
     * Collects all renderables from the container and its children using a simple collection method.
     * This method is used when the container is marked as simple.
     * @param {InstructionSet} instructionSet - The set of instructions to which the renderables will be added.
     * @param {Renderer} renderer - The renderer responsible for rendering the scene.
     * @param {IRenderLayer} currentLayer - The current render layer being processed.
     */
    collectRenderablesSimple(instructionSet: InstructionSet, renderer: Renderer, currentLayer: IRenderLayer): void;

    /**
     * Collects all renderables from the container and its children using an advanced collection method.
     * This method is used when the container is not marked as simple and may involve more complex processing.
     * @param {InstructionSet} instructionSet - The set of instructions to which the renderables will be added.
     * @param {Renderer} renderer - The renderer responsible for rendering the scene.
     * @param {RenderLayer} currentLayer - The current render layer being processed.
     */
    collectRenderablesWithEffects(
        instructionSet: InstructionSet,
        renderer: Renderer,
        currentLayer: IRenderLayer,
    ): void;
}

export const collectRenderablesMixin: Partial<Container> = {

    collectRenderables(instructionSet: InstructionSet, renderer: Renderer, currentLayer: IRenderLayer
    ): void
    {
        // we want to skip any children that are not in the current layer
        if ((this.parentRenderLayer && this.parentRenderLayer !== currentLayer)
            // if there is 0b01 or 0b10 the return value
            || this.globalDisplayStatus < 0b111 || !this.includeInBuild) return;

        if (this.sortableChildren)
        {
            this.sortChildren();
        }

        if (this.isSimple)
        {
            this.collectRenderablesSimple(instructionSet, renderer, currentLayer);
        }
        else if (this.renderGroup)
        {
            renderer.renderPipes.renderGroup.addRenderGroup(this.renderGroup, instructionSet);
        }
        else
        {
            this.collectRenderablesWithEffects(instructionSet, renderer, currentLayer);
        }
    },

    collectRenderablesSimple(
        instructionSet: InstructionSet,
        renderer: Renderer,
        currentLayer: IRenderLayer,
    ): void
    {
        const children = this.children;
        const length = children.length;

        for (let i = 0; i < length; i++)
        {
            children[i].collectRenderables(instructionSet, renderer, currentLayer);
        }
    },

    collectRenderablesWithEffects(
        instructionSet: InstructionSet,
        renderer: Renderer,
        currentLayer: IRenderLayer,
    ): void
    {
        const { renderPipes } = renderer;

        for (let i = 0; i < this.effects.length; i++)
        {
            const effect = this.effects[i];
            const pipe = renderPipes[effect.pipe as keyof RenderPipes]as InstructionPipe<any>;

            pipe.push(effect, this, instructionSet);
        }

        this.collectRenderablesSimple(instructionSet, renderer, currentLayer);

        // loop backwards through effects
        for (let i = this.effects.length - 1; i >= 0; i--)
        {
            const effect = this.effects[i];
            const pipe = renderPipes[effect.pipe as keyof RenderPipes]as InstructionPipe<any>;

            pipe.pop(effect, this, instructionSet);
        }
    }
} as Container;
