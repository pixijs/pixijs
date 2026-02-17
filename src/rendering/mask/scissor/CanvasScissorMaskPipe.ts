import { ExtensionType } from '../../../extensions/Extensions';
import { type Rectangle } from '../../../maths/shapes/Rectangle';

import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { Graphics } from '../../../scene/graphics/shared/Graphics';
import type { FillInstruction } from '../../../scene/graphics/shared/GraphicsContext';
import type { CrossPlatformCanvasRenderingContext2D } from '../../renderers/canvas/CanvasContextSystem';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { ScissorMask } from './ScissorMask';
import type { ScissorMaskInstruction } from './ScissorMaskPipe';

/**
 * Canvas renderer pipe for scissor masks. Since canvas has no hardware scissor test,
 * this falls back to using the canvas `clip()` API with a rectangular path.
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
    private _maskStack: boolean[] = [];

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

    public pop(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'scissorMask',
            action: 'popMask',
            mask,
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
            const didClip = this._maskStack.pop();

            if (didClip)
            {
                context.restore();
            }

            return;
        }

        // pushMask
        const maskContainer = (instruction.mask as ScissorMask).mask;
        const graphics = maskContainer as Graphics;
        const graphicsContext = graphics.context;

        if (!graphicsContext?.instructions?.length)
        {
            this._maskStack.push(false);

            return;
        }

        const fillInstruction = graphicsContext.instructions[0] as FillInstruction;
        const path = fillInstruction.data.path;
        const shapePrimitives = path.shapePath.shapePrimitives;
        const primitive = shapePrimitives[0];
        const rect = primitive.shape as Rectangle;

        context.save();
        contextSystem.setContextTransform(
            graphics.groupTransform,
            ((canvasRenderer._roundPixels | graphics._roundPixels) as 0 | 1) === 1
        );

        // If the shape has a local transform, apply it
        if (primitive.transform && !primitive.transform.isIdentity())
        {
            const t = primitive.transform;

            context.transform(t.a, t.b, t.c, t.d, t.tx, t.ty);
        }

        context.beginPath();
        context.rect(rect.x, rect.y, rect.width, rect.height);
        context.clip();

        this._maskStack.push(true);
    }

    public destroy()
    {
        this._renderer = null;
        this._maskStack = null;
    }
}
