import type { Batch, Batcher } from '../../../../rendering/batcher/shared/Batcher';
import type { WebGLRenderer } from '../../../../rendering/renderers/gl/WebGLRenderer';
import type { InstructionSet } from '../../../../rendering/renderers/shared/instructions/InstructionSet';
import type { Shader } from '../../../../rendering/renderers/shared/shader/Shader';
import type { State } from '../../../../rendering/renderers/shared/state/State';

/**
 * Shared GL draw loop used by both GraphicsPipe and SmoothGraphicsPipe adaptors.
 * Binds shader + geometry, iterates batches, binds textures, and issues draw calls.
 * @param renderer - The WebGL renderer
 * @param shader - The compiled shader to use
 * @param batcher - The batcher containing geometry
 * @param instructions - The instruction set with batch draw commands
 * @param state - The render state (blend mode, etc.)
 * @internal
 */
export function executeGlBatches(
    renderer: WebGLRenderer,
    shader: Shader,
    batcher: Batcher,
    instructions: InstructionSet,
    state: State,
): void
{
    shader.groups[0] = renderer.globalUniforms.bindGroup;

    renderer.state.set(state);

    renderer.shader.bind(shader);

    renderer.geometry.bind(batcher.geometry, shader.glProgram);

    const batches = instructions.instructions as Batch[];

    for (let i = 0; i < instructions.instructionSize; i++)
    {
        const batch = batches[i];

        if (batch.size)
        {
            for (let j = 0; j < batch.textures.count; j++)
            {
                renderer.texture.bind(batch.textures.textures[j], j);
            }

            renderer.geometry.draw(batch.topology, batch.size, batch.start);
        }
    }
}
