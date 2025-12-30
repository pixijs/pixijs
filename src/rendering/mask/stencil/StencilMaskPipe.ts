import { ExtensionType } from '../../../extensions/Extensions';
import { type Matrix } from '../../../maths/matrix/Matrix';
import { Graphics } from '../../../scene/graphics/shared/Graphics';
import { warn } from '../../../utils/logging/warn';
import { CLEAR } from '../../renderers/gl/const';
import { STENCIL_MODES } from '../../renderers/shared/state/const';
import { RendererType } from '../../renderers/types';

import type { ShapePrimitive } from '../../../maths/shapes/ShapePrimitive';
import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { ShapePrimitiveWithHoles } from '../../../scene/graphics/shared/path/ShapePath';
import type { CrossPlatformCanvasRenderingContext2D } from '../../renderers/canvas/CanvasContextSystem';
import type { WebGLRenderer } from '../../renderers/gl/WebGLRenderer';
import type { WebGPURenderer } from '../../renderers/gpu/WebGPURenderer';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../renderers/shared/Renderable';
import type { Renderer } from '../../renderers/types';
import type { StencilMask } from './StencilMask';

/** @internal */
type MaskMode = 'pushMaskBegin' | 'pushMaskEnd' | 'popMaskBegin' | 'popMaskEnd';

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
export interface StencilMaskInstruction extends Instruction
{
    renderPipeId: 'stencilMask',
    action: MaskMode,
    inverse: boolean,
    mask: StencilMask,
}

/** @internal */
export class StencilMaskPipe implements InstructionPipe<StencilMaskInstruction>
{
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'stencilMask',
    } as const;

    private _renderer: Renderer;
    private _warnedMaskTypes = new Set<string>();
    private _canvasMaskStack: boolean[] = [];

    // used when building and also when executing..
    private _maskStackHash: Record<number, number> = {};

    private _maskHash = new WeakMap<StencilMask, {
        instructionsStart: number,
        instructionsLength: number,
    }>();

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public push(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        const effect = mask as StencilMask;

        const renderer = this._renderer;

        if (renderer.type === RendererType.CANVAS)
        {
            renderer.renderPipes.batch.break(instructionSet);

            instructionSet.add({
                renderPipeId: 'stencilMask',
                action: 'pushMaskBegin',
                mask,
                inverse: _container._maskOptions.inverse,
                canBundle: false,
            } as StencilMaskInstruction);

            return;
        }

        renderer.renderPipes.batch.break(instructionSet);

        renderer.renderPipes.blendMode.setBlendMode(effect.mask as Renderable, 'none', instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'pushMaskBegin',
            mask,
            inverse: _container._maskOptions.inverse,
            canBundle: false,
        } as StencilMaskInstruction);

        const maskContainer = effect.mask;

        maskContainer.includeInBuild = true;

        if (!this._maskHash.has(effect))
        {
            this._maskHash.set(effect, {
                instructionsStart: 0,
                instructionsLength: 0,
            });
        }

        const maskData = this._maskHash.get(effect);

        maskData.instructionsStart = instructionSet.instructionSize;

        maskContainer.collectRenderables(
            instructionSet,
            renderer,
            null
        );

        maskContainer.includeInBuild = false;

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'pushMaskEnd',
            mask,
            inverse: _container._maskOptions.inverse,
            canBundle: false,
        } as StencilMaskInstruction);

        const instructionsLength = instructionSet.instructionSize - maskData.instructionsStart - 1;

        maskData.instructionsLength = instructionsLength;

        const renderTargetUid = renderer.renderTarget.renderTarget.uid;

        this._maskStackHash[renderTargetUid] ??= 0;
    }

    public pop(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        const effect = mask as StencilMask;

        const renderer = this._renderer;

        if (renderer.type === RendererType.CANVAS)
        {
            renderer.renderPipes.batch.break(instructionSet);

            instructionSet.add({
                renderPipeId: 'stencilMask',
                action: 'popMaskEnd',
                mask,
                inverse: _container._maskOptions.inverse,
                canBundle: false,
            } as StencilMaskInstruction);

            return;
        }

        // stencil is stored based on current render target..
        renderer.renderPipes.batch.break(instructionSet);
        renderer.renderPipes.blendMode.setBlendMode(effect.mask as Renderable, 'none', instructionSet);

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'popMaskBegin',
            inverse: _container._maskOptions.inverse,
            canBundle: false,
        } as StencilMaskInstruction);

        const maskData = this._maskHash.get(mask as StencilMask);

        for (let i = 0; i < maskData.instructionsLength; i++)
        {
            // eslint-disable-next-line max-len
            instructionSet.instructions[instructionSet.instructionSize++] = instructionSet.instructions[maskData.instructionsStart++];
        }

        instructionSet.add({
            renderPipeId: 'stencilMask',
            action: 'popMaskEnd',
            canBundle: false,
        });
    }

    public execute(instruction: StencilMaskInstruction)
    {
        const renderer = this._renderer;

        if (renderer.type === RendererType.CANVAS)
        {
            if (instruction.action !== 'pushMaskBegin' && instruction.action !== 'popMaskEnd')
            {
                return;
            }

            const canvasRenderer = renderer as unknown as {
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

            return;
        }

        const gpuRenderer = renderer as WebGLRenderer | WebGPURenderer;
        const renderTargetUid = renderer.renderTarget.renderTarget.uid;

        let maskStackIndex = this._maskStackHash[renderTargetUid] ??= 0;

        if (instruction.action === 'pushMaskBegin')
        {
            // we create the depth and stencil buffers JIT
            // as no point allocating the memory if we don't use it
            gpuRenderer.renderTarget.ensureDepthStencil();

            gpuRenderer.stencil.setStencilMode(STENCIL_MODES.RENDERING_MASK_ADD, maskStackIndex);

            maskStackIndex++;

            gpuRenderer.colorMask.setMask(0);
        }
        else if (instruction.action === 'pushMaskEnd')
        {
            if (instruction.inverse)
            {
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.INVERSE_MASK_ACTIVE, maskStackIndex);
            }
            else
            {
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.MASK_ACTIVE, maskStackIndex);
            }

            gpuRenderer.colorMask.setMask(0xF);
        }
        else if (instruction.action === 'popMaskBegin')
        {
            gpuRenderer.colorMask.setMask(0);

            if (maskStackIndex !== 0)
            {
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.RENDERING_MASK_REMOVE, maskStackIndex);
            }
            else
            {
                gpuRenderer.renderTarget.clear(null, CLEAR.STENCIL);
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.DISABLED, maskStackIndex);
            }

            maskStackIndex--;
        }
        else if (instruction.action === 'popMaskEnd')
        {
            if (instruction.inverse)
            {
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.INVERSE_MASK_ACTIVE, maskStackIndex);
            }
            else
            {
                gpuRenderer.stencil.setStencilMode(STENCIL_MODES.MASK_ACTIVE, maskStackIndex);
            }

            gpuRenderer.colorMask.setMask(0xF);
        }

        this._maskStackHash[renderTargetUid] = maskStackIndex;
    }

    public destroy()
    {
        this._renderer = null;
        this._maskStackHash = null;
        this._maskHash = null;
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
