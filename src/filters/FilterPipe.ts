import { ExtensionType } from '../extensions/Extensions';

import type { InstructionSet } from '../rendering/renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';
import type { Effect } from '../scene/container/Effect';
import type { FilterInstruction } from './FilterSystem';

const typeSymbol = Symbol.for('pixijs.FilterPipe');

/** @internal */
export class FilterPipe implements InstructionPipe<FilterInstruction>
{
    /**
     * Type symbol used to identify instances of FilterPipe.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a FilterPipe.
     * @param obj - The object to check.
     * @returns True if the object is a FilterPipe, false otherwise.
     */
    public static isFilterPipe(obj: any): obj is FilterPipe
    {
        return !!obj && !!obj[typeSymbol];
    }

    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'filter',
    } as const;

    private _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public push(filterEffect: Effect, container: Container, instructionSet: InstructionSet): void
    {
        const renderPipes = this._renderer.renderPipes;

        renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'filter',
            canBundle: false,
            action: 'pushFilter',
            container,
            filterEffect,
        } as FilterInstruction);
    }

    public pop(_filterEffect: Effect, _container: Container, instructionSet: InstructionSet): void
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'filter',
            action: 'popFilter',
            canBundle: false,
        });
    }

    public execute(instruction: FilterInstruction)
    {
        if (instruction.action === 'pushFilter')
        {
            this._renderer.filter.push(instruction);
        }
        else if (instruction.action === 'popFilter')
        {
            this._renderer.filter.pop();
        }
    }

    public destroy(): void
    {
        this._renderer = null;
    }
}
