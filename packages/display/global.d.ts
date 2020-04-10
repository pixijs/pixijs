declare type Container = import('./src').Container;

declare namespace GlobalMixins {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject
    {

    }

    interface DisplayObjectEvents extends PIXI.utils.BaseEventTypes
    {
        added: [Container];
        removed: [Container];
    }

    interface ContainerEvents extends DisplayObjectEvents
    {
        childAdded: [GlobalMixins.DisplayObject, Container, number];
        childRemoved: [GlobalMixins.DisplayObject, Container, number];
    }
}
