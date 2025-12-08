import { type GL2DNode } from './node';
import { type GL2DResource } from './resources';

/**
 * Represents the root file structure for a gl2D scene.
 *
 * This is the top-level container that defines a complete gl2D scene file,
 * including metadata, scene definitions, node hierarchy, and all resources
 * required for rendering.
 * @example
 * ```typescript
 * const sceneFile: GL2DFile = {
 *   asset: {
 *     version: "1.0",
 *     generator: "gl2d-example-generator"
 *   },
 *   scene: 0, // Active scene index
 *   scenes: [
 *     {
 *       name: "MainScene",
 *       nodes: [0, 1] // References to nodes array
 *     }
 *   ],
 *   nodes: [
 *     {
 *       type: "container",
 *       name: "Player",
 *       children: [1],
 *       transform: { position: [200, 150] },
 *     }
 *   ],
 *   resources: [
 *     { type: "texture", src: "/textures/hero.png" }
 *   ]
 * };
 * ```
 * @category gl2d
 * @standard
 */
export interface GL2DFile extends GL2DExtension
{
    /** Asset metadata including version and generator information */
    asset: GL2DAsset;

    /** The index of the default scene */
    scene?: number;

    /** Array of scene definitions, each containing references to nodes */
    scenes?: GL2DScene[];

    /** Names of gl2D extensions used in this asset. */
    extensionsUsed?: string[];
    /** Names of gl2D extensions required to properly load this asset. */
    extensionsRequired?: string[];

    /** Flat array of all nodes in the file, referenced by index from scenes */
    nodes: GL2DNode[];

    /** Array of all resources (textures, audio, fonts, etc.) used by the scene */
    resources: GL2DResource[];
}

/**
 * Represents a GL2D extension, allowing for custom properties and behaviors.
 * @category gl2d
 * @standard
 */
export interface GL2DExtension<T extends Record<string, any> = Record<string, any>>
{
    /** JSON object with extension-specific objects. */
    extensions?: T
    /** Application-specific data. */
    extras?: Record<string, any>;
}

/**
 * GL2D Asset Metadata
 * @example
 * ```json
 * {
 *   "version": "1.0",
 *   "generator": "gl2d-example-generator",
 *   "minVersion": "1.0"
 * }
 * ```
 * @category gl2d
 * @standard
 */
export interface GL2DAsset extends GL2DExtension
{
    /** The version of the GL2D file format in the form <major>.<minor> that this asset targets */
    version: string;

    /** The name of the tool or library that generated this asset */
    generator?: string;

    /** The minimum version of the GL2D file format that this asset requires */
    minVersion?: string;
}

/**
 * Represents a GL2D scene definition within a GL2D file.
 *
 * A scene acts as a container that references specific nodes from the file's
 * global nodes array. Multiple scenes can exist in a single GL2D file, allowing
 * for different game states, levels, or UI screens.
 * @example
 * ```typescript
 * const mainScene: GL2DScene = {
 *   name: "MainGameplay",
 *   nodes: [0, 1, 2] // References nodes at indices 0, 1, and 2
 * };
 *
 * const menuScene: GL2DScene = {
 *   name: "MainMenu",
 *   nodes: [3, 4] // References different nodes for menu UI
 * };
 *
 * // In the complete file structure:
 * const sceneFile: GL2DFile = {
 *   scene: 0, // MainGameplay scene is active
 *   scenes: [mainScene, menuScene],
 *   nodes: [
 *     // Index 0-2: gameplay nodes
 *     { name: "Player" },
 *     { name: "Enemy" },
 *     { name: "GameUI" },
 *     // Index 3-4: menu nodes
 *     { name: "MenuBackground" },
 *     { name: "StartButton" }
 *   ]
 * };
 * ```
 * @category gl2d
 * @standard
 */
export interface GL2DScene extends GL2DExtension
{
    /** human-readable name for the scene (e.g., "MainMenu", "Level1") */
    name: string;

    /** The indices of each root node. */
    nodes: number[];
}
