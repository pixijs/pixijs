import type { Rectangle } from '../maths/shapes/Rectangle';

/**
 * The CullingMixin interface provides properties and methods for managing culling behavior
 * of a display object. Culling is the process of determining whether an object should be rendered
 * based on its visibility within the current view or frame.
 *
 * Key Features:
 * - Custom culling areas for better performance
 * - Per-object culling control
 * - Child culling management
 * @example
 * ```ts
 * // Enable culling for a container
 * const container = new Container();
 * container.cullable = true;
 *
 * // Set custom cull area for better performance
 * container.cullArea = new Rectangle(0, 0, 800, 600);
 *
 * // Disable child culling for static scenes
 * container.cullableChildren = false;
 * ```
 * @category scene
 * @standard
 */
export interface CullingMixinConstructor
{
    /**
     * Custom shape used for culling calculations instead of object bounds.
     * Defined in local space coordinates relative to the object.
     * > [!NOTE]
     * > Setting this to a custom Rectangle allows you to define a specific area for culling,
     * > which can improve performance by avoiding expensive bounds calculations.
     * @example
     * ```ts
     * const container = new Container();
     *
     * // Define custom culling boundary
     * container.cullArea = new Rectangle(0, 0, 800, 600);
     *
     * // Reset to use object bounds
     * container.cullArea = null;
     * ```
     * @remarks
     * - Improves performance by avoiding bounds calculations
     * - Useful for containers with many children
     * - Set to null to use object bounds
     * @default null
     */
    cullArea: Rectangle;

    /**
     * Controls whether this object should be culled when out of view.
     * When true, the object will not be rendered if its bounds are outside the visible area.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     *
     * // Enable culling
     * sprite.cullable = true;
     *
     * // Force object to always render
     * sprite.cullable = false;
     * ```
     * @remarks
     * - Does not affect transform updates
     * - Applies to this object only
     * - Children follow their own cullable setting
     * @default false
     */
    cullable: boolean;

    /**
     * Controls whether children of this container can be culled.
     * When false, skips recursive culling checks for better performance.
     * @example
     * ```ts
     * const container = new Container();
     *
     * // Enable container culling
     * container.cullable = true;
     *
     * // Disable child culling for performance
     * container.cullableChildren = false;
     *
     * // Children will always render if container is visible
     * container.addChild(sprite1, sprite2, sprite3);
     * ```
     * @remarks
     * - Improves performance for static scenes
     * - Useful when children are always within container bounds
     * - Parent culling still applies
     * @default true
     */
    cullableChildren: boolean;
}

/** @internal */
export const cullingMixin: CullingMixinConstructor = {
    cullArea: null,
    cullable: false,
    cullableChildren: true,
};
