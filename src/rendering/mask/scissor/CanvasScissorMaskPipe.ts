import { ExtensionType } from '../../../extensions/Extensions';
import { ScissorMask } from './ScissorMask';

import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { CrossPlatformCanvasRenderingContext2D } from '../../renderers/canvas/CanvasContextSystem';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { ScissorMaskInstruction } from './ScissorMaskTypes';

/**
 * CanvasScissorMaskPipe handles scissor masks for the Canvas renderer
 * by using the canvas clipping API with a simple rectangle path.
 * @internal
 */
export class CanvasScissorMaskPipe implements InstructionPipe<ScissorMaskInstruction>
{
    public static extension = {
        type: [
            ExtensionType.CanvasPipes,
        ],
        name: 'scissorMask',
    } as const;

    private _renderer: Renderer;
    private _canvasMaskStack: boolean[] = [];

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public push(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'scissorMask',
            action: 'pushMask',
            mask,
            canBundle: false,
        } as ScissorMaskInstruction);
    }

    public pop(_mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'scissorMask',
            action: 'popMask',
            mask: _mask,
            canBundle: false,
        } as ScissorMaskInstruction);
    }

    public execute(instruction: ScissorMaskInstruction)
    {
        const canvasRenderer = this._renderer as unknown as {
            canvasContext: {
                activeContext: CrossPlatformCanvasRenderingContext2D;
                setContextTransform: (transform: Matrix, roundPixels?: boolean) => void;
            };
            _roundPixels: number;
        };
        const contextSystem = canvasRenderer.canvasContext;
        const context = contextSystem?.activeContext;

        if (!context) return;

        if (instruction.action === 'popMask')
        {
            const didClip = this._canvasMaskStack.pop();

            if (didClip)
            {
                context.restore();
            }

            return;
        }

        // pushMask
        const maskEffect = instruction.mask as ScissorMask;
        const maskContainer = maskEffect.mask;

        const localRect = ScissorMask.getLocalRect(maskContainer);

        if (!localRect)
        {
            this._canvasMaskStack.push(false);

            return;
        }

        context.save();

        const roundPixels = ((canvasRenderer._roundPixels | (maskContainer as any)._roundPixels) as 0 | 1) === 1;

        contextSystem.setContextTransform(maskContainer.groupTransform, roundPixels);
        context.beginPath();
        context.rect(localRect.x, localRect.y, localRect.width, localRect.height);
        context.clip();

        this._canvasMaskStack.push(true);
    }

    public destroy()
    {
        this._renderer = null;
        this._canvasMaskStack = null;
    }
}
