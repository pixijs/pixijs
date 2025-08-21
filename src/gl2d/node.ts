import { type BLEND_MODES } from '../rendering/renderers/shared/state/const';
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
