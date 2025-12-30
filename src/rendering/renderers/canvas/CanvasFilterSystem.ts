import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { Bounds } from '../../../scene/container/bounds/Bounds';
import { getGlobalRenderableBounds } from '../../../scene/container/bounds/getRenderableBounds';

import type { ICanvasRenderingContext2D } from '../../../environment/canvas/ICanvasRenderingContext2D';
import type { Filter } from '../../../filters/Filter';
import type { FilterInstruction } from '../../../filters/FilterSystem';
import type { Container } from '../../../scene/container/Container';
import type { System } from '../shared/system/System';

/**
 * Interface for filters that can supply a CSS filter string for Canvas2D.
 * @category filters
 * @advanced
 */
export interface CanvasFilterCapable
{
    /** Returns CSS filter string (e.g., 'blur(5px)') or null if not supported */
    getCanvasFilterString(): string | null;
}

/**
 * Check if a filter supports Canvas2D rendering.
 * @param filter - The filter to check
 * @returns True if the filter implements getCanvasFilterString()
 * @internal
 */
export function isCanvasFilterCapable(filter: Filter): filter is Filter & CanvasFilterCapable
{
    return typeof (filter as unknown as CanvasFilterCapable).getCanvasFilterString === 'function';
}

/**
 * Internal data stored per filter stack entry.
 * @internal
 */
class CanvasFilterFrame
{
    public skip = false;
    public filters: Filter[] = null;
    public container: Container = null;
    public bounds = new Bounds();
    public cssFilterString = '';
}

/**
 * Canvas2D filter system that applies compatible filters using CSS filter strings.
 * Unsupported filters are skipped with a warn-once message.
 * @category rendering
 * @advanced
 */
export class CanvasFilterSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.CanvasSystem],
        name: 'filter',
    } as const;

    /** The renderer this system is attached to */
    public readonly renderer: {
        canvasContext: {
            activeContext: ICanvasRenderingContext2D;
        };
    };

    private _filterStack: CanvasFilterFrame[] = [];
    private _filterStackIndex = 0;
    private _savedStates: { filter: string; alphaMultiplier: number }[] = [];
    private _alphaMultiplier = 1;
    private _warnedFilterTypes = new Set<string>();

    /**
     * @param renderer - The Canvas renderer
     * @param renderer.canvasContext
     * @param renderer.canvasContext.activeContext
     */
    constructor(renderer: {
        canvasContext: {
            activeContext: ICanvasRenderingContext2D;
        };
    })
    {
        this.renderer = renderer;
    }

    /**
     * Push a filter instruction onto the stack.
     * Called when entering a filtered container.
     * @param instruction - The filter instruction from FilterPipe
     */
    public push(instruction: FilterInstruction): void
    {
        const filterFrame = this._pushFilterFrame();
        const filters = instruction.filterEffect.filters as Filter[];

        filterFrame.skip = false;
        filterFrame.filters = filters;
        filterFrame.container = instruction.container;
        filterFrame.cssFilterString = '';

        if (filters.every((filter) => !filter.enabled))
        {
            filterFrame.skip = true;

            return;
        }

        const cssFilters: string[] = [];
        let alphaMultiplier = 1;

        for (const filter of filters)
        {
            if (!filter.enabled) continue;

            if (this._isAlphaFilter(filter))
            {
                const alphaValue = this._getAlphaFilterValue(filter);

                if (alphaValue !== null)
                {
                    alphaMultiplier *= alphaValue;
                }

                continue;
            }

            if (!isCanvasFilterCapable(filter))
            {
                this._warnUnsupportedFilter(filter);

                continue;
            }

            const cssString = filter.getCanvasFilterString();

            if (cssString === null)
            {
                this._warnUnsupportedFilter(filter);

                continue;
            }

            if (cssString)
            {
                cssFilters.push(cssString);
            }
        }

        if (cssFilters.length === 0 && alphaMultiplier === 1)
        {
            filterFrame.skip = true;

            return;
        }

        filterFrame.cssFilterString = cssFilters.join(' ');

        this._calculateFilterArea(instruction, filterFrame.bounds);

        const context = this.renderer.canvasContext.activeContext;
        const previousFilter = context.filter || 'none';

        this._savedStates.push({ filter: previousFilter, alphaMultiplier: this._alphaMultiplier });

        if (alphaMultiplier !== 1)
        {
            this._alphaMultiplier *= alphaMultiplier;
        }

        if (filterFrame.cssFilterString)
        {
            context.filter = previousFilter !== 'none'
                ? `${previousFilter} ${filterFrame.cssFilterString}`
                : filterFrame.cssFilterString;
        }
    }

    /** Pop a filter from the stack. Called when exiting a filtered container. */
    public pop(): void
    {
        const filterFrame = this._popFilterFrame();

        if (filterFrame.skip)
        {
            return;
        }

        const savedState = this._savedStates.pop();

        if (!savedState)
        {
            return;
        }

        const context = this.renderer.canvasContext.activeContext;

        context.filter = savedState.filter;
        this._alphaMultiplier = savedState.alphaMultiplier;
    }

    /**
     * Calculate the filter area bounds.
     * @param instruction - Filter instruction
     * @param bounds - Bounds object to populate
     */
    private _calculateFilterArea(instruction: FilterInstruction, bounds: Bounds): void
    {
        if (instruction.renderables)
        {
            getGlobalRenderableBounds(instruction.renderables, bounds);
        }
        else if (instruction.filterEffect.filterArea)
        {
            bounds.clear();
            bounds.addRect(instruction.filterEffect.filterArea);
            bounds.applyMatrix(instruction.container.worldTransform);
        }
        else
        {
            instruction.container.getFastGlobalBounds(true, bounds);
        }

        if (instruction.container)
        {
            const renderGroup = instruction.container.renderGroup || instruction.container.parentRenderGroup;
            const filterFrameTransform = renderGroup?.cacheToLocalTransform;

            if (filterFrameTransform)
            {
                bounds.applyMatrix(filterFrameTransform);
            }
        }
    }

    private _warnUnsupportedFilter(filter: Filter): void
    {
        const filterName = filter?.constructor?.name || 'Filter';

        if (this._warnedFilterTypes.has(filterName))
        {
            return;
        }

        this._warnedFilterTypes.add(filterName);
        console.warn(
            `CanvasRenderer: filter "${filterName}" is not supported in Canvas2D and will be skipped.`
        );
    }

    private _isAlphaFilter(filter: Filter): boolean
    {
        return filter?.constructor?.name === 'AlphaFilter';
    }

    private _getAlphaFilterValue(filter: Filter): number | null
    {
        const value = (filter as Filter & { alpha?: number }).alpha;

        if (!Number.isFinite(value)) return null;

        return Math.min(1, Math.max(0, value));
    }

    public get alphaMultiplier(): number
    {
        return this._alphaMultiplier;
    }

    private _pushFilterFrame(): CanvasFilterFrame
    {
        let filterFrame = this._filterStack[this._filterStackIndex];

        if (!filterFrame)
        {
            filterFrame = this._filterStack[this._filterStackIndex] = new CanvasFilterFrame();
        }

        this._filterStackIndex++;

        return filterFrame;
    }

    private _popFilterFrame(): CanvasFilterFrame
    {
        this._filterStackIndex--;

        return this._filterStack[this._filterStackIndex];
    }

    /** Destroys the system */
    public destroy(): void
    {
        this._filterStack = null;
        this._savedStates = null;
        this._warnedFilterTypes = null;
        this._alphaMultiplier = 1;
    }
}

extensions.add(CanvasFilterSystem);
