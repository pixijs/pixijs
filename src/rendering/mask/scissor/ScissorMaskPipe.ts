import { ExtensionType } from '../../../extensions/Extensions';
import { Rectangle } from '../../../maths/shapes/Rectangle';

import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { Graphics } from '../../../scene/graphics/shared/Graphics';
import type { FillInstruction } from '../../../scene/graphics/shared/GraphicsContext';
import type { WebGLRenderer } from '../../renderers/gl/WebGLRenderer';
import type { WebGPURenderer } from '../../renderers/gpu/WebGPURenderer';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { ScissorMask } from './ScissorMask';

/** @internal */
export type ScissorMaskAction = 'pushMask' | 'popMask';

/** @internal */
export interface ScissorMaskInstruction extends Instruction
{
    renderPipeId: 'scissorMask';
    action: ScissorMaskAction;
    mask: ScissorMask;
}

const tempRect = new Rectangle();

/**
 * Computes the world-space axis-aligned bounding rectangle of the mask's rectangle.
 * Because ScissorMask only activates for axis-aligned rectangles (no rotation/skew on
 * the shape itself), we only need to handle the container's world transform which may
 * include translation, scale, and possibly rotation/skew.
 *
 * If the world transform has rotation or skew (b !== 0 or c !== 0), we return null
 * to signal that scissor masking cannot be used at this point.
 * @param mask - The mask container (a Graphics with a single rect fill)
 * @param renderer - The renderer (used to get render target info)
 * @returns A Rectangle in pixel coordinates for the scissor rect, or null if invalid
 * @internal
 */
function getScissorRect(mask: Container, renderer: Renderer): Rectangle | null
{
    const graphics = mask as Graphics;
    const context = graphics.context;
    const instruction = context.instructions[0] as FillInstruction;
    const data = instruction.data;
    const path = data.path;
    const shapePrimitives = path.shapePath.shapePrimitives;
    const primitive = shapePrimitives[0];
    const rect = primitive.shape as Rectangle;
    const shapeTransform = primitive.transform;

    // Get the rectangle's local coordinates
    let localX = rect.x;
    let localY = rect.y;
    let localW = rect.width;
    let localH = rect.height;

    // If the shape has a local transform (translation/scale only, rotation already rejected)
    if (shapeTransform && !shapeTransform.isIdentity())
    {
        const t = shapeTransform;

        localX = (t.a * localX) + t.tx;
        localY = (t.d * localY) + t.ty;
        localW *= t.a;
        localH *= t.d;
    }

    // Normalize negative dimensions
    if (localW < 0)
    {
        localX += localW;
        localW = -localW;
    }

    if (localH < 0)
    {
        localY += localH;
        localH = -localH;
    }

    // Now transform through the container's world transform
    const wt = mask.worldTransform;

    // Check for rotation/skew in the world transform - if present, fall back
    if (wt.b !== 0 || wt.c !== 0) return null;

    // With only scale/translate: x' = a*x + tx, y' = d*y + ty
    let worldX = (wt.a * localX) + wt.tx;
    let worldY = (wt.d * localY) + wt.ty;
    let worldW = wt.a * localW;
    let worldH = wt.d * localH;

    // Normalize negative dimensions from negative scale
    if (worldW < 0)
    {
        worldX += worldW;
        worldW = -worldW;
    }

    if (worldH < 0)
    {
        worldY += worldH;
        worldH = -worldH;
    }

    // Convert from world coordinates to pixel coordinates
    const renderTarget = renderer.renderTarget.renderTarget;
    const resolution = renderTarget.resolution;
    const viewport = renderer.renderTarget.viewport;

    // The projection maps from world space to clip space, and viewport maps to pixels.
    // For a standard 2D projection in PixiJS, we can just scale by resolution.
    const pixelX = worldX * resolution;
    const pixelY = worldY * resolution;
    const pixelW = worldW * resolution;
    const pixelH = worldH * resolution;

    // Clamp to viewport bounds
    const vpRight = viewport.x + viewport.width;
    const vpBottom = viewport.y + viewport.height;

    const clampedX = Math.max(pixelX, viewport.x);
    const clampedY = Math.max(pixelY, viewport.y);
    const clampedRight = Math.min(pixelX + pixelW, vpRight);
    const clampedBottom = Math.min(pixelY + pixelH, vpBottom);

    const clampedW = Math.max(0, clampedRight - clampedX);
    const clampedH = Math.max(0, clampedBottom - clampedY);

    tempRect.x = Math.round(clampedX);
    tempRect.y = Math.round(clampedY);
    tempRect.width = Math.round(clampedW);
    tempRect.height = Math.round(clampedH);

    return tempRect;
}

/**
 * ScissorMaskPipe handles scissor mask instructions for both WebGL and WebGPU renderers.
 *
 * It uses `gl.scissor()` for WebGL and `setScissorRect()` for WebGPU to restrict
 * rendering to an axis-aligned rectangle. This is significantly faster than stencil
 * masking because it avoids extra draw calls.
 * @internal
 */
export class ScissorMaskPipe implements InstructionPipe<ScissorMaskInstruction>
{
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
        ],
        name: 'scissorMask',
    } as const;

    private _renderer: Renderer;

    /** Stack of scissor rects per render target for proper push/pop */
    private _maskStackHash: Record<number, Rectangle[]> = {};

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public push(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        const renderer = this._renderer;

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'scissorMask',
            action: 'pushMask',
            mask,
            canBundle: false,
        } as ScissorMaskInstruction);
    }

    public pop(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        const renderer = this._renderer;

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'scissorMask',
            action: 'popMask',
            mask,
            canBundle: false,
        } as ScissorMaskInstruction);
    }

    public execute(instruction: ScissorMaskInstruction)
    {
        const renderer = this._renderer;
        const renderTargetUid = renderer.renderTarget.renderTarget.uid;

        if (instruction.action === 'pushMask')
        {
            const mask = instruction.mask as ScissorMask;
            const scissorRect = getScissorRect(mask.mask, renderer);

            if (!this._maskStackHash[renderTargetUid])
            {
                this._maskStackHash[renderTargetUid] = [];
            }

            const maskStack = this._maskStackHash[renderTargetUid];

            // If there is already a scissor rect active, intersect with it
            if (maskStack.length > 0 && scissorRect)
            {
                const currentRect = maskStack[maskStack.length - 1];
                const intersected = new Rectangle();

                const left = Math.max(scissorRect.x, currentRect.x);
                const top = Math.max(scissorRect.y, currentRect.y);
                const right = Math.min(scissorRect.x + scissorRect.width, currentRect.x + currentRect.width);
                const bottom = Math.min(scissorRect.y + scissorRect.height, currentRect.y + currentRect.height);

                intersected.x = left;
                intersected.y = top;
                intersected.width = Math.max(0, right - left);
                intersected.height = Math.max(0, bottom - top);

                maskStack.push(intersected);
                this._applyScissorRect(intersected);
            }
            else if (scissorRect)
            {
                maskStack.push(new Rectangle(scissorRect.x, scissorRect.y, scissorRect.width, scissorRect.height));
                this._applyScissorRect(scissorRect);
            }
        }
        else if (instruction.action === 'popMask')
        {
            const maskStack = this._maskStackHash[renderTargetUid];

            if (maskStack)
            {
                maskStack.pop();
            }

            if (maskStack && maskStack.length > 0)
            {
                // Restore the previous scissor rect
                const prevRect = maskStack[maskStack.length - 1];

                this._applyScissorRect(prevRect);
            }
            else
            {
                // Disable scissor test - restore to full viewport
                this._disableScissor();
            }
        }
    }

    private _applyScissorRect(rect: Rectangle): void
    {
        const renderer = this._renderer;
        const isWebGL = 'gl' in renderer;

        if (isWebGL)
        {
            const glRenderer = renderer as WebGLRenderer;
            const gl = glRenderer.gl;

            // WebGL scissor Y is from bottom-left, need to flip
            const renderTarget = renderer.renderTarget.renderTarget;
            const source = renderTarget.colorTexture;

            let scissorY: number;

            if (renderTarget.isRoot)
            {
                // For the root render target, Y is flipped from the bottom
                scissorY = source.pixelHeight - rect.y - rect.height;
            }
            else
            {
                scissorY = rect.y;
            }

            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(
                rect.x,
                scissorY,
                rect.width,
                rect.height,
            );
        }
        else
        {
            const gpuRenderer = renderer as WebGPURenderer;
            const encoder = gpuRenderer.encoder;

            if (encoder.renderPassEncoder)
            {
                encoder.renderPassEncoder.setScissorRect(
                    rect.x,
                    rect.y,
                    Math.max(1, rect.width),
                    Math.max(1, rect.height),
                );
            }
        }
    }

    private _disableScissor(): void
    {
        const renderer = this._renderer;
        const isWebGL = 'gl' in renderer;

        if (isWebGL)
        {
            const glRenderer = renderer as WebGLRenderer;
            const gl = glRenderer.gl;

            gl.disable(gl.SCISSOR_TEST);
        }
        else
        {
            const gpuRenderer = renderer as WebGPURenderer;
            const encoder = gpuRenderer.encoder;

            if (encoder.renderPassEncoder)
            {
                // Reset scissor rect to full viewport
                const viewport = renderer.renderTarget.viewport;

                encoder.renderPassEncoder.setScissorRect(
                    viewport.x,
                    viewport.y,
                    viewport.width,
                    viewport.height,
                );
            }
        }
    }

    public destroy()
    {
        this._renderer = null;
        this._maskStackHash = null;
    }
}
