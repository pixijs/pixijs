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

declare type InteractionPointerEvents = 'pointerdown'
    | 'pointercancel'
    | 'pointerup'
    | 'pointertap'
    | 'pointerupoutside'
    | 'pointermove'
    | 'pointerover'
    | 'pointerout';

declare type InteractionTouchEvents = 'touchstart'
    | 'touchcancel'
    | 'touchend'
    | 'touchendoutside'
    | 'touchmove'
    | 'tap';

declare type InteractionMouseEvents = 'rightdown'
    | 'mousedown'
    | 'rightup'
    | 'mouseup'
    | 'rightclick'
    | 'click'
    | 'rightupoutside'
    | 'mouseupoutside'
    | 'mousemove'
    | 'mouseover'
    | 'mouseout';

declare type InteractionEventTypes = InteractionPointerEvents | InteractionTouchEvents | InteractionMouseEvents;

declare type InteractionEvents = { [EventType in InteractionEventTypes]: [import('./src').InteractionEvent] };

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

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObjectEvents extends InteractionEvents
    {

    }
}
