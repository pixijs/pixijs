declare module '*.frag' {
    const value: string;

    export default value;
}

declare module '*.vert' {
    const value: string;

    export default value;
}

declare type InteractionTrackingData = any;

declare type Cursor = 'auto'
    | 'default'
    | 'none'
    | 'context-menu'
    | 'help'
    | 'pointer'
    | 'progress'
    | 'wait'
    | 'cell'
    | 'crosshair'
    | 'text'
    | 'vertical-text'
    | 'alias'
    | 'copy'
    | 'move'
    | 'no-drop'
    | 'not-allowed'
    | 'e-resize'
    | 'n-resize'
    | 'ne-resize'
    | 'nw-resize'
    | 's-resize'
    | 'se-resize'
    | 'sw-resize'
    | 'w-resize'
    | 'ns-resize'
    | 'ew-resize'
    | 'nesw-resize'
    | 'col-resize'
    | 'nwse-resize'
    | 'row-resize'
    | 'all-scroll'
    | 'zoom-in'
    | 'zoom-out'
    | 'grab'
    | 'grabbing';

declare interface IHitArea {
    contains(x: number, y: number): boolean;
}

declare interface InteractiveTarget {
    interactive: boolean;
    interactiveChildren: boolean;
    hitArea: IHitArea;
    cursor: Cursor;
    buttonMode: boolean;
    trackedPointers: Map<number, InteractionTrackingData>;
}

import type { Container } from '@pixi/display';
import type { Sprite } from '@pixi/sprite';
import type { TilingSprite } from '@pixi/sprite-tiling';

declare type InteractiveObject = Container | Sprite | TilingSprite;
