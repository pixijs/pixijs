import { ExtensionType } from '../../../extensions/Extensions';

import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { ColorMask } from './ColorMask';

export interface ColorMaskInstruction extends Instruction
{
    renderPipeId: 'colorMask',
    colorMask: number,
}

export class ColorMaskPipe implements InstructionPipe<ColorMaskInstruction>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'colorMask',
    } as const;

    private readonly _renderer: Renderer;
    private _colorStack: number[] = [];
    private _colorStackIndex = 0;
    private _currentColor = 0;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public buildStart()
    {
        this._colorStack[0] = 0xF;
        this._colorStackIndex = 1;
        this._currentColor = 0xF;
    }

    public push(mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        const renderer = this._renderer;

        renderer.renderPipes.batch.break(instructionSet);

        const colorStack = this._colorStack;

        colorStack[this._colorStackIndex] = colorStack[this._colorStackIndex - 1] & (mask as ColorMask).mask;

        const currentColor = this._colorStack[this._colorStackIndex];

        if (currentColor !== this._currentColor)
        {
            this._currentColor = currentColor;
            instructionSet.add({
                renderPipeId: 'colorMask',
                colorMask: currentColor,
                canBundle: false,
            } as ColorMaskInstruction);
        }

        this._colorStackIndex++;
    }

    public pop(_mask: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        const renderer = this._renderer;

        renderer.renderPipes.batch.break(instructionSet);

        const colorStack = this._colorStack;

        this._colorStackIndex--;

        const currentColor = colorStack[this._colorStackIndex - 1];

        if (currentColor !== this._currentColor)
        {
            this._currentColor = currentColor;

            instructionSet.add({
                renderPipeId: 'colorMask',
                colorMask: currentColor,
                canBundle: false,
            } as ColorMaskInstruction);
        }
    }

    public execute(instruction: ColorMaskInstruction)
    {
        const renderer = this._renderer;

        renderer.colorMask.setMask(instruction.colorMask);
    }

    public destroy()
    {
        this._colorStack = null;
    }
}
