import { ExtensionType } from '../../../extensions/Extensions';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { MaskFilter } from '../../filters/mask/MaskFilter';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { RenderTarget } from '../../renderers/shared/renderTarget/RenderTarget';
import type { Texture } from '../../renderers/shared/texture/Texture';
import type { Renderer } from '../../renderers/types';
import type { Container } from '../../scene/Container';
import type { ColorMask } from './ColorMask';

export interface ColorMaskInstruction extends Instruction
{
    type: 'colorMask',
    colorMask: number,
}

export interface ColorMaskData
{
    previousRenderTarget: RenderTarget,
    filter: [MaskFilter],
    container: Container,
    filterTexture: Texture,
}

export class ColorMaskPipe implements InstructionPipe<ColorMaskInstruction>
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererPipes,
            ExtensionType.WebGPURendererPipes,
            ExtensionType.CanvasRendererPipes,
        ],
        name: 'colorMask',
    };

    private renderer: Renderer;
    private colorStack: number[] = [];
    private colorStackIndex = 0;
    private currentColor = 0;

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    buildStart()
    {
        this.colorStack[0] = 0xF;
        this.colorStackIndex = 1;
        this.currentColor = 0xF;
    }

    push(mask: ColorMask, _container: Container, instructionSet: InstructionSet): void
    {
        const renderer = this.renderer;

        renderer.renderPipes.batch.break(instructionSet);

        const colorStack = this.colorStack;

        colorStack[this.colorStackIndex] = colorStack[this.colorStackIndex - 1] & mask.mask;

        const currentColor = this.colorStack[this.colorStackIndex];

        if (currentColor !== this.currentColor)
        {
            this.currentColor = currentColor;
            instructionSet.add({
                type: 'colorMask',
                colorMask: currentColor,
                canBundle: false,
            } as ColorMaskInstruction);
        }

        this.colorStackIndex++;
    }

    pop(_mask: ColorMask, _container: Container, instructionSet: InstructionSet): void
    {
        const renderer = this.renderer;

        renderer.renderPipes.batch.break(instructionSet);

        const colorStack = this.colorStack;

        this.colorStackIndex--;

        const currentColor = colorStack[this.colorStackIndex - 1];

        if (currentColor !== this.currentColor)
        {
            this.currentColor = currentColor;

            instructionSet.add({
                type: 'colorMask',
                colorMask: currentColor,
                canBundle: false,
            } as ColorMaskInstruction);
        }
    }

    execute(instruction: ColorMaskInstruction)
    {
        const renderer = this.renderer;

        renderer.colorMask.setMask(instruction.colorMask);
    }
}
