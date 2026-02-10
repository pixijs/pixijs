import { ExtensionType } from '../../../extensions/Extensions';
import { Rectangle } from '../../../maths/shapes/Rectangle';
import { RendererType } from '../../renderers/types';
import { ScissorMask } from './ScissorMask';

import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { WebGLRenderer } from '../../renderers/gl/WebGLRenderer';
import type { WebGPURenderer } from '../../renderers/gpu/WebGPURenderer';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { ScissorMaskInstruction } from './ScissorMaskTypes';

/**
 * ScissorMaskPipe handles pushing and popping scissor masks for WebGL and WebGPU renderers.
 * Instead of using the stencil buffer (which requires extra draw calls), this pipe
 * uses the GPU scissor test to clip rendering to an axis-aligned rectangle.
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

    /** Stack of scissor rects per render target, allowing nested scissor masks. */
    private _scissorStackHash: Record<number, Rectangle[]> = {};

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
            mask: mask as ScissorMask,
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
            mask: mask as ScissorMask,
            canBundle: false,
        } as ScissorMaskInstruction);
    }

    public execute(instruction: ScissorMaskInstruction)
    {
        const renderer = this._renderer;
        const renderTargetUid = renderer.renderTarget.renderTarget.uid;

        if (instruction.action === 'pushMask')
        {
            const scissorStack = this._scissorStackHash[renderTargetUid] ??= [];

            // Compute the screen-space scissor rect from the mask
            const scissorRect = this._computeScissorRect(instruction.mask);

            // If there's already a scissor, intersect with it
            if (scissorStack.length > 0)
            {
                const currentScissor = scissorStack[scissorStack.length - 1];

                scissorRect.fit(currentScissor);
            }

            scissorStack.push(scissorRect);

            this._applyScissor(scissorRect);
        }
        else if (instruction.action === 'popMask')
        {
            const scissorStack = this._scissorStackHash[renderTargetUid];

            scissorStack.pop();

            if (scissorStack.length > 0)
            {
                const previousScissor = scissorStack[scissorStack.length - 1];

                this._applyScissor(previousScissor);
            }
            else
            {
                this._disableScissor();
            }
        }
    }

    private _computeScissorRect(mask: ScissorMask): Rectangle
    {
        const renderer = this._renderer;
        const maskContainer = mask.mask;

        const localRect = ScissorMask.getLocalRect(maskContainer);

        if (!localRect) return new Rectangle(0, 0, 0, 0);

        // Get the world transform of the mask
        const wt = maskContainer.worldTransform;

        // Transform all four corners of the rectangle
        const x0 = localRect.x;
        const y0 = localRect.y;
        const x1 = localRect.x + localRect.width;
        const y1 = localRect.y + localRect.height;

        // Transform corners using the full world matrix
        const tlX = (wt.a * x0) + (wt.c * y0) + wt.tx;
        const tlY = (wt.b * x0) + (wt.d * y0) + wt.ty;
        const trX = (wt.a * x1) + (wt.c * y0) + wt.tx;
        const trY = (wt.b * x1) + (wt.d * y0) + wt.ty;
        const blX = (wt.a * x0) + (wt.c * y1) + wt.tx;
        const blY = (wt.b * x0) + (wt.d * y1) + wt.ty;
        const brX = (wt.a * x1) + (wt.c * y1) + wt.tx;
        const brY = (wt.b * x1) + (wt.d * y1) + wt.ty;

        // Compute the axis-aligned bounding box of the transformed rectangle
        const minX = Math.min(tlX, trX, blX, brX);
        const minY = Math.min(tlY, trY, blY, brY);
        const maxX = Math.max(tlX, trX, blX, brX);
        const maxY = Math.max(tlY, trY, blY, brY);

        // Convert from scene coordinates to pixel coordinates using the resolution
        const resolution = renderer.renderTarget.rootRenderTarget.colorTexture.source._resolution;

        return new Rectangle(
            Math.round(minX * resolution),
            Math.round(minY * resolution),
            Math.round((maxX - minX) * resolution),
            Math.round((maxY - minY) * resolution),
        );
    }

    private _applyScissor(rect: Rectangle): void
    {
        const renderer = this._renderer;

        if (renderer.type === RendererType.WEBGL)
        {
            const gl = (renderer as WebGLRenderer).gl;
            const renderTarget = renderer.renderTarget.renderTarget;

            // In WebGL, scissor Y is from bottom-left
            let y = rect.y;

            if (renderTarget.isRoot)
            {
                const pixelHeight = renderTarget.colorTexture.source.pixelHeight;

                y = pixelHeight - rect.y - rect.height;
            }

            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(rect.x, y, rect.width, rect.height);
        }
        else
        {
            const encoder = (renderer as WebGPURenderer).encoder;

            if (encoder.renderPassEncoder)
            {
                encoder.renderPassEncoder.setScissorRect(
                    rect.x,
                    rect.y,
                    Math.max(rect.width, 1),
                    Math.max(rect.height, 1)
                );
            }
        }
    }

    private _disableScissor(): void
    {
        const renderer = this._renderer;

        if (renderer.type === RendererType.WEBGL)
        {
            const gl = (renderer as WebGLRenderer).gl;

            gl.disable(gl.SCISSOR_TEST);
        }
        else
        {
            // Reset scissor to the full viewport size
            const viewport = renderer.renderTarget.viewport;
            const encoder = (renderer as WebGPURenderer).encoder;

            if (encoder.renderPassEncoder)
            {
                encoder.renderPassEncoder.setScissorRect(
                    viewport.x,
                    viewport.y,
                    viewport.width,
                    viewport.height
                );
            }
        }
    }

    public destroy()
    {
        this._renderer = null;
        this._scissorStackHash = null;
    }
}
