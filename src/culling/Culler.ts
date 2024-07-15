import { Bounds } from '../scene/container/bounds/Bounds';
import { getGlobalBounds } from '../scene/container/bounds/getGlobalBounds';

import type { Container } from '../scene/container/Container';

const tempBounds = new Bounds();

type RectangleLike = {x: number, y: number, width: number, height: number};

/**
 * The Culler class is responsible for managing and culling containers.
 *
 *
 * Culled containers will not be rendered, and their children will not be processed. This can be useful for
 * performance optimization when dealing with large scenes.
 * @example
 * import { Culler, Container } from 'pixi.js';
 *
 * const culler = new Culler();
 * const stage = new Container();
 *
 * ... set up stage ...
 *
 * culler.cull(stage, { x: 0, y: 0, width: 800, height: 600 });
 * renderer.render(stage);
 * @memberof scene
 */
export class Culler
{
    /**
     * Culls the children of a specific container based on the given view. This will also cull items that are not
     * being explicitly managed by the culler.
     * @param container - The container to cull.
     * @param view - The view rectangle.
     * @param skipUpdateTransform - Whether to skip updating the transform.
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

    /** A shared instance of the Culler class. */
    public static shared = new Culler();
}
