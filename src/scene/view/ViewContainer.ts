import { type InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import { type RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import { type Renderer } from '../../rendering/renderers/types';
import { Bounds } from '../container/bounds/Bounds';
import { Container, type ContainerOptions } from '../container/Container';
import { type IRenderLayer } from '../layers/RenderLayer';

import type { PointData } from '../../maths/point/PointData';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { DestroyOptions } from '../container/destroyTypes';

/** @internal */
export interface GPUData
{
    destroy: () => void;
}

/**
 * Options for the construction of a ViewContainer.
 * @category scene
 * @advanced
 */
export interface ViewContainerOptions extends ContainerOptions, PixiMixins.ViewContainerOptions {}
// eslint-disable-next-line requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface ViewContainer<GPU_DATA extends GPUData = any> extends PixiMixins.ViewContainer, Container
{
    // eslint-disable-next-line requireMemberAPI/require-member-api-doc
    _gpuData: Record<number, GPU_DATA>;
}

/**
 * A ViewContainer is a type of container that represents a view.
 * This view can be a Sprite, a Graphics object, or any other object that can be rendered.
 * This class is abstract and should not be used directly.
 * @category scene
 * @advanced
 */
export abstract class ViewContainer<GPU_DATA extends GPUData = any> extends Container implements View
{
    /** @internal */
    public override readonly renderPipeId: string;
    /** @internal */
    public readonly canBundle = true;
    /** @internal */
    public override allowChildren = false;

    /** @internal */
    public _roundPixels: 0 | 1 = 0;
    /** @internal */
    public _lastUsed = -1;

    /** @internal */
    public _gpuData: Record<number, GPU_DATA> = Object.create(null);

    protected _bounds: Bounds = new Bounds(0, 1, 0, 0);
    protected _boundsDirty = true;

    /**
     * The local bounds of the view in its own coordinate space.
     * Bounds are automatically updated when the view's content changes.
     * @example
     * ```ts
     * // Get bounds dimensions
     * const bounds = view.bounds;
     * console.log(`Width: ${bounds.maxX - bounds.minX}`);
     * console.log(`Height: ${bounds.maxY - bounds.minY}`);
     * ```
     * @returns The rectangular bounds of the view
     * @see {@link Bounds} For bounds operations
     */
    public get bounds()
    {
        if (!this._boundsDirty) return this._bounds;

        this.updateBounds();

        this._boundsDirty = false;

        return this._bounds;
    }

    /** @private */
    protected abstract updateBounds(): void;

    /**
     * Whether or not to round the x/y position of the sprite.
     * @example
     * ```ts
     * // Enable pixel rounding for crisp rendering
     * view.roundPixels = true;
     * ```
     * @default false
     */
    get roundPixels()
    {
        return !!this._roundPixels;
    }

    set roundPixels(value: boolean)
    {
        this._roundPixels = value ? 1 : 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(options: ViewContainerOptions)
    {
        super(options);
    }

    /**
     * Checks if the object contains the given point in local coordinates.
     * Uses the view's bounds for hit testing.
     * @example
     * ```ts
     * // Basic point check
     * const localPoint = { x: 50, y: 25 };
     * const contains = view.containsPoint(localPoint);
     * console.log('Point is inside:', contains);
     * ```
     * @param point - The point to check in local coordinates
     * @returns True if the point is within the view's bounds
     * @see {@link ViewContainer#bounds} For the bounds used in hit testing
     * @see {@link Container#toLocal} For converting global coordinates to local
     */
    public containsPoint(point: PointData)
    {
        const bounds = this.bounds;
        const { x, y } = point;

        return (x >= bounds.minX
            && x <= bounds.maxX
            && y >= bounds.minY
            && y <= bounds.maxY);
    }

    /** @private */
    public abstract batched: boolean;

    /** @private */
    protected onViewUpdate()
    {
        this._didViewChangeTick++;

        this._boundsDirty = true;

        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.onChildViewUpdate(this);
        }
    }

    public override destroy(options?: DestroyOptions): void
    {
        super.destroy(options);

        this._bounds = null;

        for (const key in this._gpuData)
        {
            (this._gpuData[key] as GPU_DATA).destroy?.();
        }

        this._gpuData = null;
    }

    /**
     * Collects renderables for the view container.
     * @param instructionSet - The instruction set to collect renderables for.
     * @param renderer - The renderer to collect renderables for.
     * @param currentLayer - The current render layer.
     * @internal
     */
    public override collectRenderablesSimple(
        instructionSet: InstructionSet,
        renderer: Renderer,
        currentLayer: IRenderLayer,
    ): void
    {
        const { renderPipes } = renderer;

        // TODO add blends in
        renderPipes.blendMode.setBlendMode(this, this.groupBlendMode, instructionSet);

        const rp = renderPipes as unknown as Record<string, RenderPipe>;

        rp[this.renderPipeId].addRenderable(this, instructionSet);

        this.didViewUpdate = false;

        const children = this.children;
        const length = children.length;

        for (let i = 0; i < length; i++)
        {
            children[i].collectRenderables(instructionSet, renderer, currentLayer);
        }
    }
}
