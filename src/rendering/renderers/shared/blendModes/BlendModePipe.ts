import { extensions, ExtensionType } from '../../../../extensions/Extensions';
import { FilterEffect } from '../../../../filters/FilterEffect';
import { RenderGroup } from '../../../../scene/container/RenderGroup';
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
 * It will insert instructions into the {@link InstructionSet} to switch the blend mode according to the
 * blend modes of the scene graph.
 *
 * This pipe is were wwe handle Advanced blend modes. Advanced blend modes essentially wrap the renderables
 * in a filter that applies the blend mode.
 *
 * You only need to use this class if you are building your own render instruction set rather than letting PixiJS build
 * the instruction set for you by traversing the scene graph
 * @category rendering
 * @internal
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

    private _renderableList?: Renderable[];
    private _activeBlendMode: BLEND_MODES;
    private readonly _blendModeStack: BLEND_MODES[] = [];

    private _isAdvanced = false;

    private _filterHash: Partial<Record<BLEND_MODES, FilterEffect>> = Object.create(null);

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
        this._renderer.runners.prerender.add(this);
    }

    public prerender()
    {
        // make sure we reset the blend modes to normal
        // this way the next render will register any changes
        this._activeBlendMode = 'normal';
        this._isAdvanced = false;
    }

    /**
     * Push a blend mode onto the internal stack and apply it to the instruction set if needed.
     * @param renderable - The renderable or {@link RenderGroup} associated with the change.
     * @param blendMode - The blend mode to activate.
     * @param instructionSet - The instruction set being built.
     */
    public pushBlendMode(renderable: Renderable | RenderGroup, blendMode: BLEND_MODES, instructionSet: InstructionSet): void
    {
        this._blendModeStack.push(blendMode);

        this.setBlendMode(renderable, blendMode, instructionSet);
    }

    /**
     * Pop the last blend mode from the stack and apply the new top-of-stack mode.
     * @param instructionSet - The instruction set being built.
     */
    public popBlendMode(instructionSet: InstructionSet): void
    {
        const blendMode = this._blendModeStack.pop() ?? 'normal';

        this.setBlendMode(null, blendMode, instructionSet);
    }

    /**
     * Ensure a blend mode switch is added to the instruction set when the mode changes.
     * If an advanced blend mode is active, subsequent renderables will be collected so they can be
     * rendered within a single filter pass.
     * @param renderable - The renderable or {@link RenderGroup} to associate with the change, or null when unwinding.
     * @param blendMode - The target blend mode.
     * @param instructionSet - The instruction set being built.
     */
    public setBlendMode(
        renderable: Renderable | RenderGroup | null,
        blendMode: BLEND_MODES,
        instructionSet: InstructionSet
    )
    {
        const isRenderGroup = renderable instanceof RenderGroup;

        if (this._activeBlendMode === blendMode)
        {
            if (this._isAdvanced && renderable !== null && !isRenderGroup)
            {
                this._renderableList.push(renderable);
            }

            return;
        }

        if (this._isAdvanced) this._endAdvancedBlendMode(instructionSet);

        this._activeBlendMode = blendMode;
        this._isAdvanced = !!BLEND_MODE_FILTERS[blendMode];

        if (this._isAdvanced) this._beginAdvancedBlendMode(renderable, instructionSet);
    }

    private _beginAdvancedBlendMode(renderable: Renderable | RenderGroup, instructionSet: InstructionSet)
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        const blendMode = this._activeBlendMode;

        if (!BLEND_MODE_FILTERS[blendMode])
        {
            // #if _DEBUG
            warn(`Unable to assign BlendMode: '${blendMode}'. `
                + `You may want to include: import 'pixi.js/advanced-blend-modes'`);
            // #endif

            return;
        }

        const filterEffect = this._ensureFilterEffect(blendMode);
        const isRenderGroup = renderable instanceof RenderGroup;
        const instruction: FilterInstruction = {
            renderPipeId: 'filter',
            action: 'pushFilter',
            filterEffect,
            renderables: isRenderGroup ? null : [renderable],
            container: isRenderGroup ? renderable.root : null,
            canBundle: false
        };

        this._renderableList = instruction.renderables;

        instructionSet.add(instruction);
    }

    private _ensureFilterEffect(blendMode: BLEND_MODES): FilterEffect
    {
        let filterEffect: FilterEffect = this._filterHash[blendMode];

        if (!filterEffect)
        {
            filterEffect = this._filterHash[blendMode] = new FilterEffect();
            filterEffect.filters = [new BLEND_MODE_FILTERS[blendMode as keyof typeof BLEND_MODE_FILTERS]()];
        }

        return filterEffect;
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
     */
    public buildEnd(instructionSet: InstructionSet)
    {
        if (!this._isAdvanced) return;

        this._endAdvancedBlendMode(instructionSet);
    }

    /**
     * Resets the blending state by ending the advanced blending mode if it's enabled.
     * @param instructionSet - The instruction set we are adding to
     * @internal
     */
    public reset(instructionSet: InstructionSet): void
    {
        if (!this._isAdvanced) return;

        this._isAdvanced = false;
        this._activeBlendMode = 'normal';
        this._endAdvancedBlendMode(instructionSet);
    }

    /** @internal */
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
