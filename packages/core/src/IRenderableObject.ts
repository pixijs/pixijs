import type { Rectangle } from '@pixi/math';
import type { Renderer } from './Renderer';

/**
 * Interface for DisplayObject to interface with Renderer.
 * The minimum APIs needed to implement a renderable object.
 */
interface IRenderableObject {
    parent: IRenderableContainer;
    enableTempParent(): IRenderableContainer;
    updateTransform(): void;
    disableTempParent(parent: IRenderableContainer): void;
    render(renderer: Renderer): void;
}

/**
 * Interface for Container to interface with Renderer.
 */
interface IRenderableContainer extends IRenderableObject {
    getLocalBounds(rect?: Rectangle, skipChildrenUpdate?: boolean): Rectangle;
}

export type { IRenderableObject, IRenderableContainer };
