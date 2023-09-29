import type { Point } from '../../../../maths/point/Point';
import type { Bounds } from '../../../../scene/container/bounds/Bounds';
import type { DestroyOptions } from '../../../../scene/container/destroyTypes';

export interface ViewObserver
{
    onViewUpdate: () => void;
}

export const emptyViewObserver: ViewObserver = {
    onViewUpdate: () => { /* empty */ },
};

export interface View
{
    uid: number;

    batched: boolean;

    /**
     * an identifier that is used to identify the type of system that will be used to render this renderable
     * eg, 'sprite' will use the sprite system (based on the systems name
     */
    renderPipeId: string;

    owner: ViewObserver;

    /**
     * this is an int because it is packed directly into an attribute in the shader
     * @internal
     */
    roundPixels?: 0 | 1;

    addBounds: (bounds: Bounds) => void;
    containsPoint: (point: Point) => boolean;

    destroy(options?: DestroyOptions): void;
}

