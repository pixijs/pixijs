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

declare namespace GlobalMixins
{
    interface InteractiveTarget {
        interactive: boolean;
        interactiveChildren: boolean;
        hitArea: IHitArea;
        cursor: Cursor;
        buttonMode: boolean;
        trackedPointers: Map<number, InteractionTrackingData>;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends Partial<InteractiveTarget>
    {

    }
}
