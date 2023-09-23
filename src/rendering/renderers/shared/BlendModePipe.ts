import { ExtensionType } from '../../../extensions/Extensions';
import { warn } from '../../../utils/logging/warn';
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
import { FilterEffect } from '../../filters/shared/FilterEffect';

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
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'blendMode',
    } as const;

    private _renderer: Renderer;

    private _renderableList: Renderable[];
    private _activeBlendMode: BLEND_MODES;

    private _isAdvanced = false;

    private _filterHash: Partial<Record<BLEND_MODES, FilterEffect>> = Object.create(null);

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public setBlendMode(renderable: Renderable, blendMode: BLEND_MODES, instructionSet: InstructionSet)
    {
        if (this._activeBlendMode === blendMode)
        {
            if (this._isAdvanced) this._renderableList.push(renderable);

            return;
        }

        this._activeBlendMode = blendMode;

        if (this._isAdvanced)
        {
            this._endAdvancedBlendMode(instructionSet);
        }

        this._isAdvanced = !!BLEND_MODE_FILTERS[blendMode];

        if (this._isAdvanced)
        {
            this._beginAdvancedBlendMode(instructionSet);

            this._renderableList.push(renderable);
        }
    }

    private _beginAdvancedBlendMode(instructionSet: InstructionSet)
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        const blendMode = this._activeBlendMode;

        if (!BLEND_MODE_FILTERS[blendMode as keyof typeof BLEND_MODE_FILTERS])
        {
            // #if _DEBUG
            warn(`Unable to assign 'BLEND_MODES.${blendMode}' using the blend mode pipeline`);
            // #endif

            return;
        }

        // this does need an execute?
        if (!this._filterHash[blendMode])
        {
            this._filterHash[blendMode] = new FilterEffect({
                filters: [new BLEND_MODE_FILTERS[blendMode as keyof typeof BLEND_MODE_FILTERS]()]
            });
        }

        const instruction: FilterInstruction = {
            type: 'filter',
            action: 'pushFilter',
            renderables: [],
            filterEffect: this._filterHash[blendMode],
            canBundle: false,
        };

        this._renderableList = instruction.renderables;
        instructionSet.add(instruction);
    }

    private _endAdvancedBlendMode(instructionSet: InstructionSet)
    {
        this._renderableList = null;
        this._renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            type: 'filter',
            action: 'popFilter',
            canBundle: false,
        });
    }

    public buildStart()
    {
        this._isAdvanced = false;
    }

    public buildEnd(instructionSet: InstructionSet)
    {
        if (this._isAdvanced)
        {
            this._endAdvancedBlendMode(instructionSet);
        }
    }

    public destroy()
    {
        this._renderer = null;
        this._renderableList = null;

        for (const i in this._filterHash)
        {
            this._filterHash[i as BLEND_MODES].destroy();
        }

        this._filterHash = null;
    }
}
