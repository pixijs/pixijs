import type { Gl2dNodePropertiesBase, Gl2dPixiContainerExtension, Gl2dTRSTransform } from './Gl2dSchema';

/**
 * Default values for core gl2d node properties.
 * Properties omitted from output when they match these values.
 * @category gl2d
 * @internal
 */
export const CORE_NODE_DEFAULTS: Required<
    Omit<Gl2dNodePropertiesBase, 'type' | 'uid' | 'name' | 'children' | 'extensions' | 'mask'>
> &
    Required<Omit<Gl2dTRSTransform, 'matrix'>> = {
        translation: [0, 0],
        rotation: 0,
        scale: [1, 1],
        alpha: 1,
        visible: true,
        blendMode: 'normal',
    };

/**
 * Default values for the pixi_container_node extension.
 * Properties omitted from output when they match these values.
 * @category gl2d
 * @internal
 */
export const PIXI_CONTAINER_DEFAULTS: Required<Omit<Gl2dPixiContainerExtension, 'blendMode'>> & {
    blendMode: string;
} = {
    origin: [0, 0],
    skew: [0, 0],
    pivot: [0, 0],
    anchor: [0, 0],
    width: 0,
    height: 0,
    tint: '#ffffff',
    blendMode: 'inherit',
    roundPixels: false,
    zIndex: 0,
    isRenderGroup: false,
    renderable: true,
    boundsArea: [0, 0, 0, 0],
    sortableChildren: false,

    // Events
    eventMode: 'passive',
    interactiveChildren: true,
    cursor: null,

    // Accessibility
    accessible: false,
    accessibleChildren: true,
    accessibleHint: null,
    accessiblePointerEvents: 'auto',
    accessibleText: null,
    accessibleTitle: null,
    accessibleType: 'button',
    tabIndex: 0,

    // Culling
    cullArea: [0, 0, 0, 0],
    cullableChildren: true,
    cullable: false,
};
