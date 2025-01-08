import { type InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import { type InstructionPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import { type Renderer, type RenderPipes } from '../../../rendering/renderers/types';
import { type IRenderLayer } from '../../layers/RenderLayer';

import type { Container } from '../Container';

/**
 * The CollectRenderablesMixin interface defines methods for collecting renderable objects
 * from a container and its children. These methods add the renderables to an instruction set,
 * which is used by the renderer to process and display the scene.
 */
export interface CollectRenderablesMixin
{
    /**
     * Collects all renderables from the container and its children, adding them to the instruction set.
     * This method decides whether to use a simple or advanced collection method based on the container's properties.
     * @param {InstructionSet} instructionSet - The set of instructions to which the renderables will be added.
     * @param {Renderer} renderer - The renderer responsible for rendering the scene.
     * @param {IRenderLayer} currentLayer - The current render layer being processed.
     * @memberof scene.Container#
     */
    collectRenderables(instructionSet: InstructionSet, renderer: Renderer, currentLayer: IRenderLayer): void;

    /**
     * Collects renderables using a simple method, suitable for containers marked as simple.
     * This method iterates over the container's children and adds their renderables to the instruction set.
     * @param {InstructionSet} instructionSet - The set of instructions to which the renderables will be added.
     * @param {Renderer} renderer - The renderer responsible for rendering the scene.
     * @param {IRenderLayer} currentLayer - The current render layer being processed.
     * @memberof scene.Container#
     */
    collectRenderablesSimple(instructionSet: InstructionSet, renderer: Renderer, currentLayer: IRenderLayer): void;

    /**
     * Collects renderables using an advanced method, suitable for containers with complex processing needs.
     * This method handles additional effects and transformations that may be applied to the renderables.
     * @param {InstructionSet} instructionSet - The set of instructions to which the renderables will be added.
     * @param {Renderer} renderer - The renderer responsible for rendering the scene.
     * @param {IRenderLayer} currentLayer - The current render layer being processed.
     * @memberof scene.Container#
     */
    collectRenderablesWithEffects(
        instructionSet: InstructionSet,
        renderer: Renderer,
        currentLayer: IRenderLayer,
    ): void;
}

/**
 * The collectRenderablesMixin provides implementations for the methods defined in the CollectRenderablesMixin interface.
 * It includes logic to determine the appropriate method for collecting renderables based on the container's properties.
 */
export const collectRenderablesMixin: Partial<Container> = {

    /**
     * Main method to collect renderables from the container and its children.
     * It checks the container's properties to decide whether to use a simple or advanced collection method.
     * @param {InstructionSet} instructionSet - The set of instructions to which the renderables will be added.
     * @param {Renderer} renderer - The renderer responsible for rendering the scene.
     * @param {IRenderLayer} currentLayer - The current render layer being processed.
     * @memberof scene.Container#
     */
    collectRenderables(instructionSet: InstructionSet, renderer: Renderer, currentLayer: IRenderLayer): void
    {
        // Skip processing if the container is not in the current render layer or is not fully visible.
        if ((this.parentRenderLayer && this.parentRenderLayer !== currentLayer)
            || this.globalDisplayStatus < 0b111 || !this.includeInBuild) return;

        // Sort children if the container has sortable children.
        if (this.sortableChildren)
        {
            this.sortChildren();
        }

        // Choose the appropriate method for collecting renderables based on the container's properties.
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

    /**
     * Simple method for collecting renderables from the container's children.
     * This method is efficient and used when the container is marked as simple.
     * @param {InstructionSet} instructionSet - The set of instructions to which the renderables will be added.
     * @param {Renderer} renderer - The renderer responsible for rendering the scene.
     * @param {IRenderLayer} currentLayer - The current render layer being processed.
     * @memberof scene.Container#
     */
    collectRenderablesSimple(
        instructionSet: InstructionSet,
        renderer: Renderer,
        currentLayer: IRenderLayer,
    ): void
    {
        const children = this.children;
        const length = children.length;

        // Iterate over each child and collect their renderables.
        for (let i = 0; i < length; i++)
        {
            children[i].collectRenderables(instructionSet, renderer, currentLayer);
        }
    },

    /**
     * Advanced method for collecting renderables, which handles additional effects.
     * This method is used when the container has complex processing needs.
     * @param {InstructionSet} instructionSet - The set of instructions to which the renderables will be added.
     * @param {Renderer} renderer - The renderer responsible for rendering the scene.
     * @param {IRenderLayer} currentLayer - The current render layer being processed.
     * @memberof scene.Container#
     */
    collectRenderablesWithEffects(
        instructionSet: InstructionSet,
        renderer: Renderer,
        currentLayer: IRenderLayer,
    ): void
    {
        const { renderPipes } = renderer;

        // Apply each effect to the renderables before collecting them.
        for (let i = 0; i < this.effects.length; i++)
        {
            const effect = this.effects[i];
            const pipe = renderPipes[effect.pipe as keyof RenderPipes] as InstructionPipe<any>;

            pipe.push(effect, this, instructionSet);
        }

        // Collect renderables using the simple method after applying effects.
        this.collectRenderablesSimple(instructionSet, renderer, currentLayer);

        // Remove effects from the renderables after collection, processing in reverse order.
        for (let i = this.effects.length - 1; i >= 0; i--)
        {
            const effect = this.effects[i];
            const pipe = renderPipes[effect.pipe as keyof RenderPipes] as InstructionPipe<any>;

            pipe.pop(effect, this, instructionSet);
        }
    }
} as Container;
