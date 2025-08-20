import { type Gl2DNode, type Gl2DSprite } from '../node';

/**
 * Represents a PixiJS container node within a GL2D file through an extension.
 *
 * Container nodes are used to group other nodes together, allowing for
 * hierarchical transformations and organization of the scene graph.
 * @category gl2d
 * @standard
 */
export type PixiGl2DContainer = Gl2DNode<'container', PixiGl2DContainerExtension>;

/**
 * Extension properties for PixiJS container nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGl2DContainerExtension
{
    /** Unique identifier for the PixiJS container node */
    pixi_container_node: {
        /** Skew transformation in radians as [x, y]. Creates parallelogram distortion. Defaults to [0, 0]. */
        skew: [number, number];
        /**
         * Pivot point for rotations and scaling as [x, y] in pixels.
         * Relative to the node's local bounds. Defaults to [0, 0] (top-left).
         */
        pivot: [number, number];
        /** Origin point for transformations as [x, y] normalized coordinates */
        origin: [number, number];
        /**
         * Anchor point within the node's content as [x, y] normalized coordinates.
         * [0, 0] = top-left, [0.5, 0.5] = center, [1, 1] = bottom-right.
         * Primarily used for sprites and text alignment.
         */
        anchor?: [number, number];

        /** Depth sorting order - higher values render on top */
        zIndex: number;

        /** Whether this node should be treated as a render group for optimization */
        isRenderGroup: boolean;

        /** Whether the node should be included in rendering */
        renderable: boolean;

        /** Cached bounds area for optimization purposes */
        boundsArea: number[];

        /** Whether to automatically sort child nodes by their zIndex values */
        sortableChildren: boolean;
    };
}

/**
 * Represents a PixiJS sprite node within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGl2DSprite = Gl2DSprite<PixiGl2DSpriteExtension>;

/**
 * Extension properties for PixiJS sprite nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGl2DSpriteExtension extends PixiGl2DContainerExtension
{
    pixi_sprite_node?: {
        /** Whether to round pixel values for crisp rendering */
        roundPixels: boolean;
    };
}
