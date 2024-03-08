import { FilterEffect } from '../../../filters/FilterEffect';
import { MaskEffectManager } from '../../../rendering/mask/MaskEffectManager';
import { BigPool } from '../../../utils/pool/PoolGroup';

import type { Filter } from '../../../filters/Filter';
import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { Container } from '../Container';
import type { Effect } from '../Effect';

export interface EffectsMixinConstructor
{
    mask?: number | Container | null;
    filters?: Filter | Filter[];
}
export interface EffectsMixin extends Required<EffectsMixinConstructor>
{
    _mask?: {mask: unknown, effect: Effect};
    _filters?: {
        filters: readonly Filter[],
        effect: FilterEffect
        filterArea?: Rectangle,
    },
    filterArea?: Rectangle,
    effects?: Effect[];
    addEffect(effect: Effect): void;
    removeEffect(effect: Effect): void;
}

export const effectsMixin: Partial<Container> = {
    _mask: null,
    _filters: null,

    /**
     * @todo Needs docs.
     * @memberof scene.Container#
     * @type {Array<Effect>}
     */
    effects: [],

    /**
     * @todo Needs docs.
     * @param effect - The effect to add.
     * @memberof scene.Container#
     * @ignore
     */
    addEffect(effect: Effect)
    {
        const index = this.effects.indexOf(effect);

        if (index !== -1) return; // already exists!

        this.effects.push(effect);

        this.effects.sort((a, b) => a.priority - b.priority);

        if (this.renderGroup)
        {
            this.renderGroup.structureDidChange = true;
        }

        this._updateIsSimple();
    },
    /**
     * @todo Needs docs.
     * @param effect - The effect to remove.
     * @memberof scene.Container#
     * @ignore
     */
    removeEffect(effect: Effect)
    {
        const index = this.effects.indexOf(effect);

        if (index === -1) return; // already exists!

        this.effects.splice(index, 1);

        if (!this.isRenderGroupRoot && this.renderGroup)
        {
            this.renderGroup.structureDidChange = true;
        }

        this._updateIsSimple();
    },

    set mask(value: number | Container | null)
    {
        this._mask ||= { mask: null, effect: null };

        if (this._mask.mask === value) return;

        if (this._mask.effect)
        {
            this.removeEffect(this._mask.effect);

            MaskEffectManager.returnMaskEffect(this._mask.effect);

            this._mask.effect = null;
        }

        this._mask.mask = value;

        if (value === null || value === undefined) return;

        const effect = MaskEffectManager.getMaskEffect(value);

        this._mask.effect = effect;

        this.addEffect(effect);
    },

    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an
     * object to the shape of the mask applied to it. In PixiJS a regular mask must be a
     * {@link Graphics} or a {@link Sprite} object. This allows for much faster masking in canvas as it
     * utilities shape clipping. Furthermore, a mask of an object must be in the subtree of its parent.
     * Otherwise, `getLocalBounds` may calculate incorrect bounds, which makes the container's width and height wrong.
     * To remove a mask, set this property to `null`.
     *
     * For sprite mask both alpha and red channel are used. Black mask is the same as transparent mask.
     * @example
     * import { Graphics, Sprite } from 'pixi.js';
     *
     * const graphics = new Graphics();
     * graphics.beginFill(0xFF3300);
     * graphics.drawRect(50, 250, 100, 100);
     * graphics.endFill();
     *
     * const sprite = new Sprite(texture);
     * sprite.mask = graphics;
     * @memberof scene.Container#
     */
    get mask(): unknown
    {
        return this._mask?.mask;
    },

    set filters(value: Filter | Filter[] | null | undefined)
    {
        if (!Array.isArray(value) && value) value = [value];

        // Ignore the Filter type
        value = value as Filter[] | null | undefined;

        // by reusing the same effect.. rather than adding and removing from the pool!
        this._filters ||= { filters: null, effect: null, filterArea: null };

        const hasFilters = value?.length > 0;
        const didChange = (this._filters.effect && !hasFilters) || (!this._filters.effect && hasFilters);

        // Clone the filters array so we don't freeze the user-input
        value = Array.isArray(value) ? value.slice(0) : value;

        // Ensure filters are immutable via filters getter
        this._filters.filters = Object.freeze(value);

        if (didChange)
        {
            if (hasFilters)
            {
                const effect = BigPool.get(FilterEffect);

                this._filters.effect = effect;
                this.addEffect(effect);
            }
            else
            {
                const effect = this._filters.effect;

                this.removeEffect(effect);

                effect.filterArea = null;
                effect.filters = null;

                this._filters.effect = null;
                BigPool.return(effect as PoolItem);
            }
        }

        if (hasFilters)
        {
            this._filters.effect.filters = value as Filter[];
            this._filters.effect.filterArea = this.filterArea;
        }
    },

    /**
     * Sets the filters for the displayObject.
     * IMPORTANT: This is a WebGL only feature and will be ignored by the canvas renderer.
     * To remove filters simply set this property to `'null'`.
     * @memberof scene.Container#
     */
    get filters(): readonly Filter[]
    {
        return this._filters?.filters;
    },

    set filterArea(value: Rectangle)
    {
        this._filters ||= { filters: null, effect: null, filterArea: null };

        this._filters.filterArea = value;
    },

    /**
     * The area the filter is applied to. This is used as more of an optimization
     * rather than figuring out the dimensions of the displayObject each frame you can set this rectangle.
     *
     * Also works as an interaction mask.
     * @memberof scene.Container#
     */
    get filterArea(): Rectangle
    {
        return this._filters?.filterArea;
    },

} as Container;
