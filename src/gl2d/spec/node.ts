import { type BLEND_MODES } from '../../rendering/renderers/shared/state/const';
import { type GL2DExtension } from './file';

/**
 * Represents a GL2D node within a GL2D file.
 *
 * Nodes are the basic building blocks of a GL2D scene, representing
 * individual elements such as sprites, containers, and other visual
 * components. Each node can have its own transform, children, and
 * other properties.
 * @example
 * ```typescript
 * const playerNode: GL2DNode = {
 *   type: "container",
 *   name: "Player",
 *   transform: { position: [100, 200], scale: [1, 1] },
 *   children: []
 * };
 * ```
 * @category gl2d
 * @standard
 */
export interface GL2DNode<T extends string = string, K extends Record<string, any> = Record<string, any>>
    extends GL2DExtension<K>
{
    /** The type of the node (e.g., "sprite", "container") */
    type: T;

    /** Unique identifier for the node */
    uid?: string;

    /** The user-defined name of this object. */
    name?: string;

    /** The child nodes of this node */
    children?: number[];

    /** The nodes rotation in radians */
    rotation?: number;
    /** The nodes scale along the x and y axes */
    scale?: [number, number];
    /** The nodes translation along the x and y axes */
    translation?: [number, number];
    /** A floating-point transformation matrix */
    matrix?: [number, number, number, number, number, number];

    /** Explicit width override for the node (overrides component-derived width) */
    width?: number;

    /** Explicit height override for the node (overrides component-derived height) */
    height?: number;

    /** Blend mode for compositing (e.g., normal, multiply, screen) */
    blendMode?: BLEND_MODES;

    /** Color tint applied to the node (0xRRGGBB format) */
    tint?: number;

    /** Opacity/transparency level (0.0 = transparent, 1.0 = opaque) */
    alpha?: number;

    /** Whether the node and its children are visible */
    visible?: boolean;
}

/**
 * Represents a GL2D sprite node within a GL2D file.
 * @category gl2d
 * @standard
 */
export interface GL2DSprite<K extends Record<string, any> = Record<string, any>> extends GL2DNode<'sprite', K>
{
    /** The index of the texture used by the sprite in the gl2D resource array */
    texture: number;
}

/**
 * Represents a GL2D tiling sprite node within a GL2D file.
 * @category gl2d
 * @standard
 */
export interface GL2DTilingSprite<K extends Record<string, any> = Record<string, any>>
    extends GL2DNode<'tiling_sprite', K>
{
    /** The index of the texture used by the sprite in the gl2D resource array */
    texture: number;
    /** The scale of the tiling texture */
    tileScale?: [number, number];
    /** The position of the tiling texture */
    tilePosition?: [number, number];
    /** The rotation of the tiling texture */
    tileRotation?: number;
}

/**
 * Represents a GL2D nine slice sprite node within a GL2D file.
 * @category gl2d
 * @standard
 */
export interface GL2DNineSliceSprite<K extends Record<string, any> = Record<string, any>>
    extends GL2DNode<'nine_slice_sprite', K>
{
    /** The index of the texture used by the sprite in the gl2D resource array */
    texture: number;
    /** The 9-slice scaling values `[left, top, right, bottom]` */
    slice9?: [number, number, number, number];
    /** Width of the left vertical bar (A). Controls the size of the left edge that remains unscaled */
    leftWidth?: number;
    /** Height of the top horizontal bar (C). Controls the size of the top edge that remains unscaled */
    topHeight?: number;
    /** Width of the right vertical bar (B). Controls the size of the right edge that remains unscaled */
    rightWidth?: number;
    /** Height of the bottom horizontal bar (D). Controls the size of the bottom edge that remains unscaled */
    bottomHeight?: number;
}

/**
 * Represents a GL2D text node within a GL2D file.
 * @category gl2d
 * @standard
 */
export interface GL2DText<K extends Record<string, any> = Record<string, any>> extends GL2DNode<'text', K>
{
    /** The text content to display */
    text: string;
    /** The resolution of the text */
    resolution?: number;
    /** The indices of the text style in the resources array */
    style: number;
    /** The index of the web font used for the text */
    webFont?: number;
}

/**
 * Represents a GL2D bitmap text node within a GL2D file.
 * @category gl2d
 * @standard
 */
export interface GL2DBitmapText<K extends Record<string, any> = Record<string, any>> extends GL2DNode<'bitmap_text', K>
{
    /** The text content to display */
    text: string;
    /** The resolution of the text */
    resolution?: number;
    /** The indices of the text style in the resources array */
    style: number;
    /** The index of the bitmap font used for the text */
    bitmapFont?: number;
}
