import type { Rectangle } from '../maths/shapes/Rectangle';

export interface CullingMixinConstructor
{
    /**
     * If set, this shape is used for culling instead of the bounds of this object.
     * It can improve the culling performance of objects with many children.
     * The culling area is defined in local space.
     * @memberof scene.Container#
     */
    cullArea: Rectangle,
    /**
     * Should this object be rendered if the bounds of this object are out of frame?
     *
     * Culling has no effect on whether updateTransform is called.
     * @default false
     * @memberof scene.Container#
     */
    cullable: boolean,
    /**
     * Determines if the children to the container can be culled
     * Setting this to false allows PixiJS to bypass a recursive culling function
     * Which can help to optimize very complex scenes
     * @default true
     * @memberof scene.Container#
     */
    cullableChildren: boolean,
}

export const cullingMixin: CullingMixinConstructor = {
    cullArea: null,
    cullable: false,
    cullableChildren: true,
};
