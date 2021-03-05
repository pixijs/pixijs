import type { Rectangle } from '@pixi/math';
import type { Renderer } from './Renderer';

/**
 * Interface for DisplayObject to interface with Renderer.
 * The minimum APIs needed to implement a renderable object.
 * @memberof PIXI
 */
interface IRenderableObject {
    /** Object must have a parent container */
    parent: IRenderableContainer;
    /** Before method for transform updates */
    enableTempParent(): IRenderableContainer;
    /** Update the transforms */
    updateTransform(): void;
    /** After method for transform updates */
    disableTempParent(parent: IRenderableContainer): void;
    /** Render object directly */
    render(renderer: Renderer): void;
}

/**
 * Interface for Container to interface with Renderer.
 * @memberof PIXI
 */
interface IRenderableContainer extends IRenderableObject {
    /** Get Local bounds for container */
    getLocalBounds(rect?: Rectangle, skipChildrenUpdate?: boolean): Rectangle;
}

export type { IRenderableObject, IRenderableContainer };
