import { Bounds } from '../scene/container/bounds/Bounds';
import { getGlobalBounds } from '../scene/container/bounds/getGlobalBounds';

import type { Container } from '../scene/container/Container';

const tempBounds = new Bounds();

/**
 * A rectangle-like object that contains x, y, width, and height properties.
 * @example
 * const rect = { x: 0, y: 0, width: 100, height: 100 };
 * @category utils
 * @advanced
 */
export type RectangleLike = {x: number, y: number, width: number, height: number};

/**
 * The Culler class is responsible for managing and culling containers.
 * Culling optimizes rendering performance by skipping objects outside the visible area.
 *
 * > [!IMPORTANT] culling is not always a golden bullet, it can be more expensive than rendering
 * > objects that are not visible, so it is best used in scenarios where you have many objects
 * > that are not visible at the same time, such as in large scenes or games with many sprites.
 * @example
 * ```ts
 * import { Culler, Container, Rectangle } from 'pixi.js';
 *
 * // Create a culler and container
 * const culler = new Culler();
 * const stage = new Container();
 *
 * // Set up container with culling
 * stage.cullable = true;
 * stage.cullArea = new Rectangle(0, 0, 800, 600);
 *
 * // Add some sprites that will be culled
 * for (let i = 0; i < 1000; i++) {
 *     const sprite = Sprite.from('texture.png');
 *     sprite.x = Math.random() * 2000;
 *     sprite.y = Math.random() * 2000;
 *     sprite.cullable = true;
 *     stage.addChild(sprite);
 * }
 *
 * // Cull objects outside view
 * culler.cull(stage, {
 *     x: 0,
 *     y: 0,
 *     width: 800,
 *     height: 600
 * });
 *
 * // Only visible objects will be rendered
 * renderer.render(stage);
 * ```
 * @see {@link CullerPlugin} For automatic culling in applications
 * @see {@link CullingMixinConstructor} For culling properties
 * @category scene
 * @standard
 */
export class Culler
{
    /**
     * Culls the children of a specific container based on the given view rectangle.
     * This determines which objects should be rendered and which can be skipped.
     * @param container - The container to cull. Must be a Container instance.
     * @param view - The view rectangle that defines the visible area
     * @param skipUpdateTransform - Whether to skip updating transforms for better performance
     * @example
     * ```ts
     * // Basic culling with view bounds
     * const culler = new Culler();
     * culler.cull(stage, {
     *     x: 0,
     *     y: 0,
     *     width: 800,
     *     height: 600
     * });
     *
     * // Culling to renderer screen
     * culler.cull(stage, renderer.screen, false);
     * ```
     * @remarks
     * - Recursively processes all cullable children
     * - Uses cullArea if defined, otherwise calculates bounds
     * - Performance depends on scene complexity
     * @see {@link CullingMixinConstructor.cullable} For enabling culling on objects
     * @see {@link CullingMixinConstructor.cullArea} For custom culling boundaries
     */
    public cull(container: Container, view: RectangleLike, skipUpdateTransform = true)
    {
        this._cullRecursive(container, view, skipUpdateTransform);
    }

    private _cullRecursive(container: Container, view: RectangleLike, skipUpdateTransform = true)
    {
        if (container.cullable && container.measurable && container.includeInBuild)
        {
            const bounds = container.cullArea ?? getGlobalBounds(container, skipUpdateTransform, tempBounds);

            // check view intersection..
            container.culled = bounds.x >= view.x + view.width
                || bounds.y >= view.y + view.height
                || bounds.x + bounds.width <= view.x
                || bounds.y + bounds.height <= view.y;
        }
        else
        {
            container.culled = false;
        }

        // dont process children if not needed
        if (
            !container.cullableChildren
            || container.culled
            || !container.renderable
            || !container.measurable
            || !container.includeInBuild
        ) return;

        for (let i = 0; i < container.children.length; i++)
        {
            this._cullRecursive(container.children[i], view, skipUpdateTransform);
        }
    }

    /**
     * A shared instance of the Culler class. Provides a global culler instance for convenience.
     * @example
     * ```ts
     * // Use the shared instance instead of creating a new one
     * Culler.shared.cull(stage, {
     *     x: 0,
     *     y: 0,
     *     width: 800,
     *     height: 600
     * });
     * ```
     * @see {@link CullerPlugin} For automatic culling using this instance
     */
    public static shared = new Culler();
}
