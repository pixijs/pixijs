import { Graphics } from '../shared/Graphics';
import { GraphicsPipe } from '../shared/GraphicsPipe';

import type { InstructionSet } from '~/rendering/renderers/shared/instructions/InstructionSet';
import type { Renderer } from '~/rendering/renderers/types';

describe('GraphicsPipe', () =>
{
    function setup()
    {
        const gpuContext = { isBatchable: false, batches: [] as unknown[] };
        const renderer = {
            uid: 1,
            runners: { contextChange: { add: () => null } },
            gc: { addResourceHash: () => null, now: 0 },
            graphicsContext: { updateGpuContext: () => gpuContext },
            renderPipes: { batch: { break: () => null, addToBatch: () => null } },
        } as unknown as Renderer;
        const pipe = new GraphicsPipe(renderer, { contextChange: () => null, init: () => null } as any);
        const instructionSet = { add: () => null } as unknown as InstructionSet;

        return { gpuContext, pipe, instructionSet };
    }

    it('should not ask for a rebuild when a non-batched graphics stays non-batched', () =>
    {
        const { pipe, instructionSet } = setup();
        const graphics = new Graphics();

        pipe.addRenderable(graphics, instructionSet);

        // its geometry is refreshed by updateGpuContext, the instructions stay the same
        expect(pipe.validateRenderable(graphics)).toBe(false);
        expect(pipe.validateRenderable(graphics)).toBe(false);

        graphics.destroy();
    });

    it('should ask for a rebuild when a non-batched graphics becomes batchable', () =>
    {
        const { gpuContext, pipe, instructionSet } = setup();
        const graphics = new Graphics();

        pipe.addRenderable(graphics, instructionSet);
        gpuContext.isBatchable = true;

        expect(pipe.validateRenderable(graphics)).toBe(true);

        graphics.destroy();
    });
});
