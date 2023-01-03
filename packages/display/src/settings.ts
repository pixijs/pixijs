import { settings, utils } from '@pixi/core';
import { Container } from './Container';

Object.defineProperties(settings, {
    /**
     * Sets the default value for the container property 'sortableChildren'.
     * @static
     * @name SORTABLE_CHILDREN
     * @memberof PIXI.settings
     * @deprecated since 7.1.0
     * @type {boolean}
     * @see PIXI.Container.defaultSortableChildren
     */
    SORTABLE_CHILDREN: {
        get()
        {
            return Container.defaultSortableChildren;
        },
        set(value: boolean)
        {
            // #if _DEBUG
            utils.deprecation('7.1.0', 'settings.SORTABLE_CHILDREN is deprecated, use Container.defaultSortableChildren');
            // #endif
            Container.defaultSortableChildren = value;
        },
    },
});

export { settings };
