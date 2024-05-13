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

interface AdvancedBlendInstruction extends Instruction
{
    renderPipeId: 'blendMode',
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

/**
 * This Pipe handles the blend mode switching of the renderer.
 * It will insert instructions into the {@link renderers.InstructionSet} to switch the blend mode according to the
 * blend modes of the scene graph.
 *
 * This pipe is were wwe handle Advanced blend modes. Advanced blend modes essentially wrap the renderables
 * in a filter that applies the blend mode.
 *
 * You only need to use this class if you are building your own render instruction set rather than letting PixiJS build
 * the instruction set for you by traversing the scene graph
 * @memberof rendering
 */
export class BlendModePipe implements InstructionPipe<AdvancedBlendInstruction>
{
    /** @ignore */
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

    /**
     * This ensures that a blendMode switch is added to the instruction set if the blend mode has changed.
     * @param renderable - The renderable we are adding to the instruction set
     * @param blendMode - The blend mode of the renderable
     * @param instructionSet - The instruction set we are adding to
     */
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
            warn(`Unable to assign BlendMode: '${blendMode}'. `
            + `You may want to include: import 'pixi.js/advanced-blend-modes'`);
            // #endif

            return;
        }

        let filterEffect = this._filterHash[blendMode];

        // this does need an execute?
        if (!filterEffect)
        {
            filterEffect = this._filterHash[blendMode] = new FilterEffect();

            filterEffect.filters = [new BLEND_MODE_FILTERS[blendMode as keyof typeof BLEND_MODE_FILTERS]()];
        }

        const instruction: FilterInstruction = {
            renderPipeId: 'filter',
            action: 'pushFilter',
            renderables: [],
            filterEffect,
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
            renderPipeId: 'filter',
            action: 'popFilter',
            canBundle: false,
        });
    }

    /**
     * called when the instruction build process is starting this will reset internally to the default blend mode
     * @internal
     * @ignore
     */
    public buildStart()
    {
        this._isAdvanced = false;
    }

    /**
     * called when the instruction build process is finished, ensuring that if there is an advanced blend mode
     * active, we add the final render instructions added to the instruction set
     * @param instructionSet - The instruction set we are adding to
     * @internal
     * @ignore
     */
    public buildEnd(instructionSet: InstructionSet)
    {
        if (this._isAdvanced)
        {
            this._endAdvancedBlendMode(instructionSet);
        }
    }

    /**
     * @internal
     * @ignore
     */
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
