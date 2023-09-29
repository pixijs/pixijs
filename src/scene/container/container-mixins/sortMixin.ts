import type { Container } from '../Container';

export interface SortMixinConstructor
{
    zIndex?: number;
    sortDirty?: boolean;
    sortableChildren?: boolean;
}
export interface SortMixin extends Required<SortMixinConstructor>
{
    _zIndex: 0;

    sortChildren: () => void;
    depthOfChildModified: () => void;
}

export const sortMixin: Partial<Container> = {
    _zIndex: 0,
    sortDirty: false,
    sortableChildren: false,

    get zIndex()
    {
        return this._zIndex;
    },

    /** The depth of the object. Setting this value, will automatically set the parent to be sortable */
    set zIndex(value)
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

        if (this.layerGroup && !this.isLayerRoot)
        {
            this.layerGroup.structureDidChange = true;
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
