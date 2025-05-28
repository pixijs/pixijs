import type { Container } from '../Container';

/** @ignore */
export interface SortMixinConstructor
{
    /**
     * The zIndex of the container.
     *
     * Setting this value, will automatically set the parent to be sortable. Children will be automatically
     * sorted by zIndex value; a higher value will mean it will be moved towards the end of the array,
     * and thus rendered on top of other display objects within the same container.
     * @see Container#sortableChildren
     * @default 0
     */
    zIndex?: number;
    /**
     * Should children be sorted by zIndex at the next render call.
     *
     * Will get automatically set to true if a new child is added, or if a child's zIndex changes.
     * @default false
     */
    sortDirty?: boolean;
    /**
     * If set to true, the container will sort its children by `zIndex` value
     * when the next render is called, or manually if `sortChildren()` is called.
     *
     * This actually changes the order of elements in the array of children,
     * so it will affect the rendering order.
     *
     * Also be aware of that this may not work nicely with the `addChildAt()` function,
     * as the `zIndex` sorting may cause the child to automatically sorted to another position.
     * @default false
     */
    sortableChildren?: boolean;
}

/**
 * The SortMixin interface provides methods and properties for sorting children of a container
 * based on their `zIndex` values. It allows for automatic sorting of children when their `zIndex`
 * changes or when new children are added. The mixin includes properties to manage sorting state
 * and methods to sort children explicitly.
 * @category scene
 * @standard
 */
export interface SortMixin extends Required<SortMixinConstructor>
{
    /** @internal */
    _zIndex: number;
    /** Sorts children by zIndex. */
    sortChildren: () => void;
    /** @internal */
    depthOfChildModified: () => void;
}

/** @internal */
export const sortMixin: Partial<Container> = {
    _zIndex: 0,
    sortDirty: false,
    sortableChildren: false,

    get zIndex()
    {
        return this._zIndex;
    },

    set zIndex(value: number)
    {
        if (this._zIndex === value) return;

        this._zIndex = value;

        this.depthOfChildModified();
    },

    depthOfChildModified()
    {
        if (this.parent)
        {
            this.parent.sortableChildren = true;
            this.parent.sortDirty = true;
        }

        if (this.parentRenderGroup)
        {
            this.parentRenderGroup.structureDidChange = true;
        }
    },

    sortChildren()
    {
        if (!this.sortDirty) return;

        this.sortDirty = false;

        this.children.sort(sortChildren);
    },
} as Container;

function sortChildren(a: Container, b: Container): number
{
    return a._zIndex - b._zIndex;
}
