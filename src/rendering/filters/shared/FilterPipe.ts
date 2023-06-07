import { ExtensionType } from '../../../extensions/Extensions';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../renderers/types';
import type { Container } from '../../scene/Container';
import type { FilterEffect } from '../FilterEffect';
import type { FilterInstruction } from './FilterSystem';

// eslint-disable-next-line max-len
export class FilterPipe implements InstructionPipe<FilterInstruction>
{
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererPipes,
            ExtensionType.WebGPURendererPipes,
            ExtensionType.CanvasRendererPipes,
        ],
        name: 'filter',
    };

    renderer: Renderer;

    filterGlobalUniforms = new UniformGroup({
        inputSize: { value: new Float32Array(4), type: 'vec4<f32>' },
        inputPixel: { value: new Float32Array(4), type: 'vec4<f32>' },
        inputClamp: { value: new Float32Array(4), type: 'vec4<f32>' },
        outputFrame: { value: new Float32Array(4), type: 'vec4<f32>' },
        backgroundFrame: { value: new Float32Array(4), type: 'vec4<f32>' },
        globalFrame: { value: new Float32Array(4), type: 'vec4<f32>' },
    });

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    push(filterEffect: FilterEffect, container: Container, instructionSet: InstructionSet): void
    {
        const renderPipes = this.renderer.renderPipes;

        renderPipes.batch.break(instructionSet);

        instructionSet.add({
            type: 'filter',
            canBundle: false,
            action: 'pushFilter',
            container,
            filterEffect,
        } as FilterInstruction);
    }

    pop(_filterEffect: FilterEffect, _container: Container, instructionSet: InstructionSet): void
    {
        this.renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            type: 'filter',
            action: 'popFilter',
            canBundle: false,
        });
    }

    execute(instruction: FilterInstruction)
    {
        if (instruction.action === 'pushFilter')
        {
            this.renderer.filter.push(instruction);
        }
        else if (instruction.action === 'popFilter')
        {
            this.renderer.filter.pop();
        }
    }
}
