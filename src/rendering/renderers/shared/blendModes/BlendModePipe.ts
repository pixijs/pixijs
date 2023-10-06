import { extensions, ExtensionType } from '../../../../extensions/Extensions';
import { FilterEffect } from '../../../../filters/FilterEffect';
import { warn } from '../../../../utils/logging/warn';

import type { BlendModeFilter } from '../../../../filters/blend-modes/BlendModeFilter';
import type { FilterInstruction } from '../../../../filters/FilterSystem';
import type { Renderer } from '../../types';
import type { Instruction } from '../instructions/Instruction';
import type { InstructionSet } from '../instructions/InstructionSet';
import type { InstructionPipe } from '../instructions/RenderPipe';
import type { Renderable } from '../Renderable';
import type { BLEND_MODES } from '../state/const';

export interface AdvancedBlendInstruction extends Instruction
{
    type: 'blendMode',
    blendMode: BLEND_MODES,
    activeBlend: Renderable[],
}

// class map
const BLEND_MODE_FILTERS: Partial<Record<BLEND_MODES, new () => BlendModeFilter>> = {} as const;

extensions.handle(ExtensionType.BlendMode, (value) =>
{
    if (!value.name)
    {
        throw new Error('BlendMode extension must have a name property');
    }
    BLEND_MODE_FILTERS[value.name as BLEND_MODES] = value.ref;
}, (value) =>
{
    delete BLEND_MODE_FILTERS[value.name as BLEND_MODES];
});

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
