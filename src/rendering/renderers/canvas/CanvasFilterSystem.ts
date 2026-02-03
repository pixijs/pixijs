import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { Bounds } from '../../../scene/container/bounds/Bounds';
import { getGlobalRenderableBounds } from '../../../scene/container/bounds/getRenderableBounds';
import { getPo2TextureFromSource } from '../../../scene/text/utils/getPo2TextureFromSource';
import { CanvasPool } from '../shared/texture/CanvasPool';
import { canvasUtils } from './utils/canvasUtils';

import type { ICanvasRenderingContext2D } from '../../../environment/canvas/ICanvasRenderingContext2D';
import type { Filter } from '../../../filters/Filter';
import type { FilterInstruction } from '../../../filters/FilterSystem';
import type { Container } from '../../../scene/container/Container';
import type { System } from '../shared/system/System';
import type { Texture } from '../shared/texture/Texture';

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
    public useClip = false;
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
            activeResolution: number;
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
     * @param renderer.canvasContext.activeResolution
     */
    constructor(renderer: {
        canvasContext: {
            activeContext: ICanvasRenderingContext2D;
            activeResolution: number;
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
        filterFrame.useClip = false;
        filterFrame.filters = filters;
        filterFrame.container = instruction.container;
        filterFrame.cssFilterString = '';

        if (filters.every((filter) => !filter.enabled))
        {
            filterFrame.skip = true;

            return;
        }

        const cssFilters: string[] = [];
        const alphaMultiplier = 1;

        for (const filter of filters)
        {
            if (!filter.enabled) continue;

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
        filterFrame.useClip = !!instruction.filterEffect.filterArea;

        const context = this.renderer.canvasContext.activeContext;
        const previousFilter = context.filter || 'none';

        this._savedStates.push({ filter: previousFilter, alphaMultiplier: this._alphaMultiplier });

        if (filterFrame.useClip
            && Number.isFinite(filterFrame.bounds.width)
            && Number.isFinite(filterFrame.bounds.height)
            && filterFrame.bounds.width > 0
            && filterFrame.bounds.height > 0)
        {
            const resolution = this.renderer.canvasContext.activeResolution || 1;

            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.beginPath();
            context.rect(
                filterFrame.bounds.x * resolution,
                filterFrame.bounds.y * resolution,
                filterFrame.bounds.width * resolution,
                filterFrame.bounds.height * resolution
            );
            context.clip();
        }
        else
        {
            filterFrame.useClip = false;
        }

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

        if (filterFrame.useClip)
        {
            context.restore();
        }
        else
        {
            context.filter = savedState.filter;
        }

        this._alphaMultiplier = savedState.alphaMultiplier;
    }

    /**
     * Applies supported filters to a texture and returns a new texture.
     * Unsupported filters are skipped with a warn-once message.
     * @param params - The parameters for applying filters.
     * @param params.texture
     * @param params.filters
     * @returns The resulting texture after filters are applied.
     */
    public generateFilteredTexture({ texture, filters }: { texture: Texture; filters: Filter[] }): Texture
    {
        if (!filters?.length || filters.every((filter) => !filter.enabled))
        {
            return texture;
        }

        const cssFilters: string[] = [];
        const alphaMultiplier = 1;

        for (const filter of filters)
        {
            if (!filter.enabled) continue;

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
            return texture;
        }

        const source = canvasUtils.getCanvasSource(texture);

        if (!source)
        {
            return texture;
        }

        const frame = texture.frame;
        const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;
        const width = frame.width;
        const height = frame.height;

        const canvasAndContext = CanvasPool.getOptimalCanvasAndContext(width, height, resolution);
        const { canvas, context } = canvasAndContext;

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (cssFilters.length)
        {
            context.filter = cssFilters.join(' ');
        }

        if (alphaMultiplier !== 1)
        {
            context.globalAlpha = alphaMultiplier;
        }

        const sx = frame.x * resolution;
        const sy = frame.y * resolution;
        const sw = width * resolution;
        const sh = height * resolution;

        context.drawImage(
            source,
            sx,
            sy,
            sw,
            sh,
            0,
            0,
            sw,
            sh
        );

        context.filter = 'none';
        context.globalAlpha = 1;

        return getPo2TextureFromSource(canvas, width, height, resolution);
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
        if (this._filterStackIndex <= 0)
        {
            return this._filterStack[0];
        }

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
