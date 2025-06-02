import type { Rectangle } from '../maths/shapes/Rectangle';

/**
 * The CullingMixin interface provides properties and methods for managing culling behavior
 * of a display object. Culling is the process of determining whether an object should be rendered
 * based on its visibility within the current view or frame. This mixin allows for optimization
 * of rendering by skipping objects that are not visible, thus improving performance in complex scenes.
 * @category scene
 */
export interface CullingMixinConstructor
{
    /**
     * If set, this shape is used for culling instead of the bounds of this object.
     * It can improve the culling performance of objects with many children.
     * The culling area is defined in local space.
     */
    cullArea: Rectangle,
    /**
     * Should this object be rendered if the bounds of this object are out of frame?
     *
     * Culling has no effect on whether updateTransform is called.
     * @default false
     */
    cullable: boolean,
    /**
     * Determines if the children to the container can be culled
     * Setting this to false allows PixiJS to bypass a recursive culling function
     * Which can help to optimize very complex scenes
     * @default true
     */
    cullableChildren: boolean,
}

/** @internal */
export const cullingMixin: CullingMixinConstructor = {
    cullArea: null,
    cullable: false,
    cullableChildren: true,
};
