import type { Container } from '../../../../scene/container/Container';
import type { Effect } from '../../../../scene/container/Effect';
import type { BatchableElement } from '../../../batcher/shared/Batcher';
import type { Renderer } from '../../types';
import type { Renderable } from '../Renderable';
import type { Instruction } from './Instruction';
import type { InstructionSet } from './InstructionSet';

/**
 * An interface for a pipe that can be used to build instructions for the renderer.
 * InstructionPipes are specifically  used to manage the state of the renderer.
 * For example, the BlendModePipe is used to set the blend mode of the renderer.
 * @memberof rendering
 */
export interface InstructionPipe<INSTRUCTION extends Instruction>
{
    /**
     * called just before we execute the draw calls , this is where the pipes have an opportunity to
     * upload data to the GPU. This is only called if data changes.
     * @param instructionSet - the instruction set currently being built
     */
    upload?: (instructionSet: InstructionSet) => void;
    /**
     * this is where the actual instruction is executed - eg make the draw call
     * activate a filter. Any instructions that have the same renderPipeId have their
     * execute method called
     * @param instruction - the instruction to execute
     */
    execute?: (instruction: INSTRUCTION) => void;

    // TODO - implement!
    buildReset?: (instructionSet: InstructionSet) => void;
    buildStart?: (instructionSet: InstructionSet) => void;
    buildEnd?: (instructionSet: InstructionSet) => void;

    /** Called just after the render ends giving the RenderPipes a chance to do any cleanup */
    renderEnd?: () => void;
    /** Called just before the render starts giving the RenderPipes a chance to do any setup */
    renderStart?: () => void;
    /**
     * Used by the effect pipes push and pop effects to the renderer. A push effect allows
     * the renderer to change its state to support the effect. A pop effect allows the renderer
     * to return to its previous state. An example of this would be the filter effect.
     * @param effect - the effect to push
     * @param targetContainer - the container that the effect is being applied to
     * @param instructionSet - the instruction set currently being built
     */
    push?: (effect: Effect, targetContainer: Container, instructionSet: InstructionSet) => void
    /**
     * Used by effect pipes to pop effects from the renderer.
     * @param effect - the effect to pop
     * @param targetContainer - the container that the effect is being applied to
     * @param instructionSet - the instruction set currently being built
     */
    pop?: (effect: Effect, targetContainer: Container, instructionSet: InstructionSet) => void
}

/**
 * An interface for a pipe that can be used to build instructions for the renderer.
 * RenderPipes are specifically used to render Renderables like a Mesh.
 * @memberof rendering
 */
export interface RenderPipe<RENDERABLE = Renderable>
{
    /**
     * This is where the renderable is added to the instruction set. This is called once per renderable.
     * For instance, a MeshRenderPipe could be used to enqueue a 'draw mesh' command
     * to the rendering instruction set, catering to the rendering of mesh geometry.
     * In more complex scenarios, such as the SpritePipe, this seamlessly coordinates
     * with a batchPipe to efficiently batch and add batch instructions to the instructions set
     *
     * Add is called when the instructions set is being built.
     * @param renderable - the renderable that needs to be rendered
     * @param instructionSet - the instruction set currently being built
     */
    addRenderable: (renderable: RENDERABLE, instructionSet: InstructionSet) => void;
    /**
     * Called whenever a renderable has been been updated, eg its position has changed.
     * This is only called in the render loop if the instructions set is being reused
     * from the last frame. Otherwise addRenderable is called.
     * @param renderable - the renderable that needs to be rendered
     */
    updateRenderable: (renderable: RENDERABLE) => void;
    /**
     * Called whenever a renderable is destroyed, often the pipes keep a webGL / webGPU specific representation
     * of the renderable that needs to be tidied up when the renderable is destroyed.
     * @param renderable - the renderable that needs to be rendered
     */
    destroyRenderable: (renderable: RENDERABLE) => void;
    /**
     * This function is called when the renderer is determining if it can use the same instruction set again to
     * improve performance. If this function returns true, the renderer will rebuild the whole instruction set
     * for the scene. This is only called if the scene has not its changed its structure .
     * @param renderable
     * @returns {boolean}
     */
    validateRenderable: (renderable: RENDERABLE) => boolean;
}

/**
 * An interface for a pipe that can be used to build instructions for the renderer.
 * BatchPipes are specifically used to build and render Batches.
 */
export interface BatchPipe
{
    /**
     * Add a add a batchable object to the batch.
     * @param renderable - a batchable object that can be added to the batch
     * @param instructionSet - the instruction set currently being built
     */
    addToBatch: (renderable: BatchableElement, instructionSet: InstructionSet) => void;
    /**
     * Forces the batch to break. This can happen if for example you need to render everything and then
     * change the render target.
     * @param instructionSet - the instruction set currently being built
     */
    break: (instructionSet: InstructionSet) => void;
}

/** A helpful type that can be used to create a new RenderPipe, BatchPipe or InstructionPipe */
export interface PipeConstructor
{
    new (renderer: Renderer, adaptor?: any): RenderPipe | BatchPipe | InstructionPipe<any> ;
}
