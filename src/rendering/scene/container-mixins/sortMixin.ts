import { deprecation } from '../../../utils/logging/deprecation';

import type { Container } from '../Container';

export interface SortMixin
{
    _depth: 0;
    depth: number;
    zIndex: number;
    sortDirty: boolean;
    sortChildren: boolean;

    sortChildrenDepth: () => void;
}

export const sortMixin: Partial<Container> = {

    _depth: 0,
    sortDirty: false,
    sortChildren: false,

    get zIndex()
    {
        return this._depth;
    },

    /** The depth of the object. Setting this value, will automatically set the parent to be sortable */
    set zIndex(value)
    {
        deprecation('v8', 'zIndex has been renamed to depth');
        this.depth = value;
    },

    get depth()
    {
        return this._depth;
    },

    /** The depth of the object. Setting this value, will automatically set the parent to be sortable */
    set depth(value)
    {
        if (this._depth === value) return;

        this._depth = value;

        if (this.layerGroup && !this.isLayerRoot)
        {
            this.parent.sortChildren = true;
            this.parent.sortDirty = true;

            this.layerGroup.structureDidChange = true;
        }
    },

    sortChildrenDepth()
    {
        if (!this.sortDirty) return;

        this.sortDirty = false;

        this.children.sort(sortChildren);
    }

} as Container;

function sortChildren(a: Container, b: Container): number
{
    return a._depth - b._depth;
}
