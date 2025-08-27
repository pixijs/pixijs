import { type PointerEvents } from '../../../accessibility/accessibilityTarget';
import { type EventMode } from '../../../events/FederatedEventTarget';
import { type GL2DNineSliceSprite, type GL2DNode, type GL2DSprite, type GL2DTilingSprite } from '../node';

/**
 * Represents a PixiJS container node within a GL2D file through an extension.
 *
 * Container nodes are used to group other nodes together, allowing for
 * hierarchical transformations and organization of the scene graph.
 * @category gl2d
 * @standard
 */
export type PixiGL2DContainer = GL2DNode<'container', PixiGL2DContainerExtension>;

/**
 * Extension properties for PixiJS container nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DContainerExtension
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
        boundsArea?: [number, number, number, number];

        /** Whether to automatically sort child nodes by their zIndex values */
        sortableChildren: boolean;

        /** Whether the node should be interactive */
        interactive?: boolean;
        /** Whether the nodes children should be interactive */
        interactiveChildren?: boolean;
        /** The event mode for the interactive element*/
        eventMode?: EventMode;
        /** The cursor type for the interactive element */
        cursor?: string;

        /** Whether this node is accessible for assistive technologies. */
        accessible?: boolean;
        /** Whether this node's children are accessible for assistive technologies. */
        accessibleChildren?: boolean;
        /** Hint text for assistive technologies. */
        accessibleHint?: string;
        /** The pointer-events the accessible div will use */
        accessiblePointerEvents?: PointerEvents;
        /** The text content of the shadow div */
        accessibleText?: string;
        /** The title attribute of the shadow div */
        accessibleTitle?: string;
        /** The type of the shadow div */
        accessibleType?: keyof HTMLElementTagNameMap;
        /** Tab index for keyboard navigation */
        tabIndex?: number;

        /** The area that should be used for culling calculations */
        cullArea?: [number, number, number, number];
        /** Whether the children of this node should be culled */
        cullableChildren?: boolean;
        /** Whether this node should be culled */
        cullable?: boolean;
    };
}

/**
 * Represents a PixiJS sprite node within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DSprite = GL2DSprite<PixiGL2DSpriteExtension>;

/**
 * Extension properties for PixiJS sprite nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DSpriteExtension extends PixiGL2DContainerExtension
{
    pixi_sprite_node?: {
        /** Whether to round pixel values for crisp rendering */
        roundPixels: boolean;
    };
}

/**
 * Represents a PixiJS tiling sprite node within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DTilingSprite = GL2DTilingSprite<PixiGL2DTilingSpriteExtension>;

/**
 * Extension properties for PixiJS tiling sprite nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DTilingSpriteExtension extends PixiGL2DContainerExtension
{
    pixi_tiling_sprite_node?: {
        /** Whether to round pixel values for crisp rendering */
        roundPixels: boolean;
        /** Whether the tiling pattern should originate from the origin instead of the top-left corner in local space */
        applyAnchorToTexture?: boolean;
    };
}

/**
 * Represents a PixiJS NineSlice sprite node within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DNineSliceSprite = GL2DNineSliceSprite<PixiGL2DNineSliceSpriteExtension>;

/**
 * Extension properties for PixiJS NineSlice sprite nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DNineSliceSpriteExtension extends PixiGL2DContainerExtension
{
    pixi_nine_slice_sprite_node?: {
        /** Whether to round pixel values for crisp rendering */
        roundPixels: boolean;
    };
}

/**
 * Represents a PixiJS Animated sprite node within a GL2D file through an extension.
 * @category gl2d
 * @standard
 */
export type PixiGL2DAnimatedSprite = GL2DNode<
    'pixi_animated_sprite',
    PixiGL2DContainerExtension & PixiGL2DAnimatedSpriteExtension
>;

/**
 * Extension properties for PixiJS Animated sprite nodes.
 * @category gl2d
 * @standard
 */
export interface PixiGL2DAnimatedSpriteExtension extends PixiGL2DContainerExtension
{
    pixi_animated_sprite_node?: {
        /** Whether to round pixel values for crisp rendering */
        roundPixels?: boolean;
        /** The speed of the animation */
        animationSpeed?: number;
        /** Whether the animation should play automatically */
        autoPlay?: boolean;
        /** Whether the animation should update automatically */
        autoUpdate?: boolean;
        /** Whether the animation should loop */
        loop?: boolean;
        /** The textures used by the animation */
        textures?: number[];
        /** The frame durations used by the animation */
        durations?: number[];
        /** Whether to update the anchor point of the animation */
        updateAnchor?: boolean;
    };
}

