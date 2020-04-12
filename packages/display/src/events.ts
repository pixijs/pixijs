import type { BaseEventTypes } from '@pixi/utils';
import type { Container } from './Container';
import type { DisplayObject } from './DisplayObject';

export interface DisplayObjectEvents extends BaseEventTypes, GlobalMixins.DisplayObjectEvents
{
    added: [Container];
    removed: [Container];
}

export interface ContainerEvents extends DisplayObjectEvents
{
    childAdded: [DisplayObject, Container, number];
    childRemoved: [DisplayObject, Container, number];
}
