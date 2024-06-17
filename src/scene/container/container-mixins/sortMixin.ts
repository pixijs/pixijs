import type { Container } from '../Container';

export interface SortMixinConstructor
{
    zIndex?: number;
    sortDirty?: boolean;
    sortableChildren?: boolean;
}
export interface SortMixin extends Required<SortMixinConstructor>
{
    _zIndex: number;

    sortChildren: () => void;
    depthOfChildModified: () => void;
}

export const sortMixin: Partial<Container> = {
    _zIndex: 0,
    /**
     * Should children be sorted by zIndex at the next render call.
     *
     * Will get automatically set to true if a new child is added, or if a child's zIndex changes.
     * @type {boolean}
     * @memberof scene.Container#
     */
    sortDirty: false,
    /**
     * If set to true, the container will sort its children by `zIndex` value
     * when the next render is called, or manually if `sortChildren()` is called.
     *
     * This actually changes the order of elements in the array, so should be treated
     * as a basic solution that is not performant compared to other solutions,
     * such as {@link https://github.com/pixijs/layers PixiJS Layers}
     *
     * Also be aware of that this may not work nicely with the `addChildAt()` function,
     * as the `zIndex` sorting may cause the child to automatically sorted to another position.
     * @type {boolean}
     * @memberof scene.Container#
     */
    sortableChildren: false,

    /**
     * The zIndex of the container.
     *
     * Setting this value, will automatically set the parent to be sortable. Children will be automatically
     * sorted by zIndex value; a higher value will mean it will be moved towards the end of the array,
     * and thus rendered on top of other display objects within the same container.
     * @see scene.Container#sortableChildren
     * @memberof scene.Container#
     */
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

    /**
     * Sorts children by zIndex.
     * @memberof scene.Container#
     */
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
