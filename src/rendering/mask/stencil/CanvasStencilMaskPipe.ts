import { ExtensionType } from '../../../extensions/Extensions';
import { type Matrix } from '../../../maths/matrix/Matrix';
import { Graphics } from '../../../scene/graphics/shared/Graphics';
import { warn } from '../../../utils/logging/warn';

import type { ShapePrimitive } from '../../../maths/shapes/ShapePrimitive';
import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { ShapePrimitiveWithHoles } from '../../../scene/graphics/shared/path/ShapePath';
import type { CrossPlatformCanvasRenderingContext2D } from '../../renderers/canvas/CanvasContextSystem';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { StencilMaskInstruction } from './StencilMaskTypes';

function buildRoundedRectPath(
    context: CrossPlatformCanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
): void
{
    radius = Math.max(0, Math.min(radius, Math.min(width, height) / 2));

    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
}

function buildShapePath(context: CrossPlatformCanvasRenderingContext2D, shape: ShapePrimitive): void
{
    switch (shape.type)
    {
        case 'rectangle':
        {
            const rect = shape as typeof shape & { width: number; height: number };

            context.rect(rect.x, rect.y, rect.width, rect.height);
            break;
        }
        case 'roundedRectangle':
        {
            const rect = shape as typeof shape & { width: number; height: number; radius: number };

            buildRoundedRectPath(context, rect.x, rect.y, rect.width, rect.height, rect.radius);
            break;
        }
        case 'circle':
        {
            const circle = shape as typeof shape & { radius: number };

            context.moveTo(circle.x + circle.radius, circle.y);
            context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            break;
        }
        case 'ellipse':
        {
            const ellipse = shape as typeof shape & { halfWidth: number; halfHeight: number };

            if (context.ellipse)
            {
                context.moveTo(ellipse.x + ellipse.halfWidth, ellipse.y);
                context.ellipse(ellipse.x, ellipse.y, ellipse.halfWidth, ellipse.halfHeight, 0, 0, Math.PI * 2);
            }
            else
            {
                context.save();
                context.translate(ellipse.x, ellipse.y);
                context.scale(ellipse.halfWidth, ellipse.halfHeight);
                context.moveTo(1, 0);
                context.arc(0, 0, 1, 0, Math.PI * 2);
                context.restore();
            }
            break;
        }
        case 'triangle':
        {
            const tri = shape as typeof shape & { x2: number; y2: number; x3: number; y3: number };

            context.moveTo(tri.x, tri.y);
            context.lineTo(tri.x2, tri.y2);
            context.lineTo(tri.x3, tri.y3);
            context.closePath();
            break;
        }
        case 'polygon':
        default:
        {
            const poly = shape as typeof shape & { points: number[]; closePath: boolean };
            const points = poly.points;

            if (!points?.length) break;

            context.moveTo(points[0], points[1]);

            for (let i = 2; i < points.length; i += 2)
            {
                context.lineTo(points[i], points[i + 1]);
            }

            if (poly.closePath)
            {
                context.closePath();
            }
            break;
        }
    }
}

function addHolePaths(
    context: CrossPlatformCanvasRenderingContext2D,
    holes?: ShapePrimitiveWithHoles[]
): boolean
{
    if (!holes?.length) return false;

    for (let i = 0; i < holes.length; i++)
    {
        const hole = holes[i];

        if (!hole?.shape) continue;

        const transform = hole.transform;
        const hasTransform = transform && !transform.isIdentity();

        if (hasTransform)
        {
            context.save();
            context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        }

        buildShapePath(context, hole.shape);

        if (hasTransform)
        {
            context.restore();
        }
    }

    return true;
}

/** @internal */
export class CanvasStencilMaskPipe implements InstructionPipe<StencilMaskInstruction>
{
    public static extension = {
        type: [
            ExtensionType.CanvasPipes,
        ],
        name: 'stencilMask',
    } as const;

    private _renderer: Renderer;
    private _warnedMaskTypes = new Set<string>();
    private _canvasMaskStack: boolean[] = [];

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public push(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'pushMaskBegin',
            mask,
            inverse: _container._maskOptions.inverse,
            canBundle: false,
        } as StencilMaskInstruction);
    }

    public pop(_mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'popMaskEnd',
            mask: _mask,
            inverse: _container._maskOptions.inverse,
            canBundle: false,
        } as StencilMaskInstruction);
    }

    public execute(instruction: StencilMaskInstruction)
    {
        if (instruction.action !== 'pushMaskBegin' && instruction.action !== 'popMaskEnd')
        {
            return;
        }

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

        if (instruction.action === 'popMaskEnd')
        {
            const didClip = this._canvasMaskStack.pop();

            if (didClip)
            {
                context.restore();
            }

            return;
        }

        if (instruction.inverse)
        {
            this._warnOnce(
                'inverse',
                'CanvasRenderer: inverse masks are not supported on Canvas2D; '
                + 'ignoring inverse flag.'
            );
        }

        const maskContainer = instruction.mask.mask;

        if (!(maskContainer instanceof Graphics))
        {
            this._warnOnce(
                'nonGraphics',
                'CanvasRenderer: only Graphics masks are supported in Canvas2D; '
                + 'skipping mask.'
            );
            this._canvasMaskStack.push(false);

            return;
        }

        const graphics = maskContainer;
        const instructions = graphics.context?.instructions;

        if (!instructions?.length)
        {
            this._canvasMaskStack.push(false);

            return;
        }

        context.save();
        contextSystem.setContextTransform(
            graphics.groupTransform,
            ((canvasRenderer._roundPixels | graphics._roundPixels) as 0 | 1) === 1
        );
        context.beginPath();

        let drewPath = false;
        let hasHoles = false;

        for (let i = 0; i < instructions.length; i++)
        {
            const instructionData = instructions[i];
            const action = instructionData.action;

            if (action !== 'fill' && action !== 'stroke') continue;

            const data = instructionData.data as {
                path?: {
                    shapePath?: {
                        shapePrimitives?: ShapePrimitiveWithHoles[];
                    };
                };
            };
            const shapePath = data?.path?.shapePath;

            if (!shapePath?.shapePrimitives?.length) continue;

            const shapePrimitives = shapePath.shapePrimitives;

            for (let j = 0; j < shapePrimitives.length; j++)
            {
                const primitive = shapePrimitives[j];

                if (!primitive?.shape) continue;

                const transform = primitive.transform;
                const hasTransform = transform && !transform.isIdentity();

                if (hasTransform)
                {
                    context.save();
                    context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
                }

                buildShapePath(context, primitive.shape as ShapePrimitive);
                hasHoles = addHolePaths(context, primitive.holes) || hasHoles;
                drewPath = true;

                if (hasTransform)
                {
                    context.restore();
                }
            }
        }

        if (!drewPath)
        {
            context.restore();
            this._canvasMaskStack.push(false);

            return;
        }

        if (hasHoles)
        {
            context.clip('evenodd');
        }
        else
        {
            context.clip();
        }

        this._canvasMaskStack.push(true);
    }

    public destroy()
    {
        this._renderer = null;
        this._warnedMaskTypes = null;
        this._canvasMaskStack = null;
    }

    private _warnOnce(key: string, message: string): void
    {
        if (this._warnedMaskTypes.has(key)) return;

        this._warnedMaskTypes.add(key);
        warn(message);
    }
}
