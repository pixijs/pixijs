import { ExtensionType } from '../../../extensions/Extensions';
import { ColorBlend } from '../../filters/blend-modes/ColorBlend';
import { ColorBurnBlend } from '../../filters/blend-modes/ColorBurnBlend';
import { ColorDodgeBlend } from '../../filters/blend-modes/ColorDodgeBlend';
import { DarkenBlend } from '../../filters/blend-modes/DarkenBlend';
import { DifferenceBlend } from '../../filters/blend-modes/DifferenceBlend';
import { DivideBlend } from '../../filters/blend-modes/DivideBlend';
import { ExclusionBlend } from '../../filters/blend-modes/ExclusionBlend';
import { HardLightBlend } from '../../filters/blend-modes/HardLightBlend';
import { HardMixBlend } from '../../filters/blend-modes/HardMixBlend';
import { LightenBlend } from '../../filters/blend-modes/LightenBlend';
import { LinearBurnBlend } from '../../filters/blend-modes/LinearBurnBlend';
import { LinearDodgeBlend } from '../../filters/blend-modes/LinearDodgeBlend';
import { LinearLightBlend } from '../../filters/blend-modes/LinearLightBlend';
import { LuminosityBlend } from '../../filters/blend-modes/LuminosityBlend';
import { NegationBlend } from '../../filters/blend-modes/NegationBlend';
import { OverlayBlend } from '../../filters/blend-modes/OverlayBlend';
import { PinLightBlend } from '../../filters/blend-modes/PinLightBlend';
import { SaturationBlend } from '../../filters/blend-modes/SaturationBlend';
import { SoftLightBlend } from '../../filters/blend-modes/SoftLightBlend';
import { SubtractBlend } from '../../filters/blend-modes/SubtractBlend';
import { VividLightBlend } from '../../filters/blend-modes/VividLightBlend';
import { FilterEffect } from '../../filters/FilterEffect';

import type { ExtensionMetadata } from '../../../extensions/Extensions';
import type { BlendModeFilter } from '../../filters/blend-modes/BlendModeFilter';
import type { FilterInstruction } from '../../filters/shared/FilterSystem';
import type { Renderer } from '../types';
import type { Instruction } from './instructions/Instruction';
import type { InstructionSet } from './instructions/InstructionSet';
import type { InstructionPipe } from './instructions/RenderPipe';
import type { Renderable } from './Renderable';
import type { BLEND_MODES } from './state/const';

export interface AdvancedBlendInstruction extends Instruction
{
    type: 'blendMode',
    blendMode: BLEND_MODES,
    activeBlend: Renderable[],
}

// class map
const BLEND_MODE_FILTERS: Partial<Record<BLEND_MODES, new () => BlendModeFilter>> = {
    color: ColorBlend,
    'color-burn': ColorBurnBlend,
    'color-dodge': ColorDodgeBlend,
    darken: DarkenBlend,
    difference: DifferenceBlend,
    divide: DivideBlend,
    exclusion: ExclusionBlend,
    'hard-light': HardLightBlend,
    'hard-mix': HardMixBlend,
    lighten: LightenBlend,
    'linear-burn': LinearBurnBlend,
    'linear-dodge': LinearDodgeBlend,
    'linear-light': LinearLightBlend,
    luminosity: LuminosityBlend,
    negation: NegationBlend,
    overlay: OverlayBlend,
    'pin-light': PinLightBlend,
    saturation: SaturationBlend,
    'soft-light': SoftLightBlend,
    subtract: SubtractBlend,
    'vivid-light': VividLightBlend,
} as const;

export class BlendModePipe implements InstructionPipe<AdvancedBlendInstruction>
{
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererPipes,
            ExtensionType.WebGPURendererPipes,
            ExtensionType.CanvasRendererPipes,
        ],
        name: 'blendMode',
    };

    private renderer: Renderer;

    private renderableList: Renderable[];
    private activeBlendMode: BLEND_MODES;

    private isAdvanced = false;

    private filterHash: Partial<Record<BLEND_MODES, FilterEffect>> = {};

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    setBlendMode(renderable: Renderable, blendMode: BLEND_MODES, instructionSet: InstructionSet)
    {
        if (this.activeBlendMode === blendMode)
        {
            if (this.isAdvanced)
            {
                this.renderableList.push(renderable);
            }

            return;
        }

        this.activeBlendMode = blendMode;

        if (this.isAdvanced)
        {
            this.endAdvancedBlendMode(instructionSet);
        }

        this.isAdvanced = !!BLEND_MODE_FILTERS[blendMode];

        if (this.isAdvanced)
        {
            this.beginAdvancedBlendMode(instructionSet);

            this.renderableList.push(renderable);
        }
    }

    private beginAdvancedBlendMode(instructionSet: InstructionSet)
    {
        this.renderer.renderPipes.batch.break(instructionSet);

        const blendMode = this.activeBlendMode;

        if (!BLEND_MODE_FILTERS[blendMode as keyof typeof BLEND_MODE_FILTERS])
        {
            console.warn(`Unable to assign 'BLEND_MODES.${blendMode}' using the blend mode pipeline`);

            return;
        }

        // this does need an execute?
        if (!this.filterHash[blendMode])
        {
            this.filterHash[blendMode] = new FilterEffect({
                filters: [new BLEND_MODE_FILTERS[blendMode as keyof typeof BLEND_MODE_FILTERS]()]
            });
        }

        const instruction: FilterInstruction = {
            type: 'filter',
            action: 'pushFilter',
            renderables: [],
            filterEffect: this.filterHash[blendMode],
            canBundle: false,
        };

        this.renderableList = instruction.renderables;
        instructionSet.add(instruction);
    }

    private endAdvancedBlendMode(instructionSet: InstructionSet)
    {
        this.renderableList = null;
        this.renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            type: 'filter',
            action: 'popFilter',
            canBundle: false,
        });
    }

    buildStart()
    {
        this.isAdvanced = false;
    }

    buildEnd(instructionSet: InstructionSet)
    {
        if (this.isAdvanced)
        {
            this.endAdvancedBlendMode(instructionSet);
        }
    }

    destroy()
    {
        this.renderer = null;
        this.renderableList = null;

        for (const i in this.filterHash)
        {
            this.filterHash[i as any as BLEND_MODES].destroy();
        }

        this.filterHash = null;
    }
}
