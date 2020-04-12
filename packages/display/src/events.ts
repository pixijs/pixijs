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

/**
 * Event types of DisplayObject.
 *
 * @interface DisplayObjectEvents
 * @extends PIXI.utils.BaseEventTypes
 * @memberof PIXI
 */

/**
 * @see {@link PIXI.DisplayObject#event:added}
 * @memberof PIXI.DisplayObjectEvents#
 * @member {Tuple<PIXI.Container>} added
 */

/**
 * @see {@link PIXI.DisplayObject#event:removed}
 * @memberof PIXI.DisplayObjectEvents#
 * @member {Tuple<PIXI.Container>} removed
 */

/**
 * Event types of Container.
 *
 * @interface ContainerEvents
 * @extends PIXI.DisplayObjectEvents
 * @memberof PIXI
 */

/**
 * @see {@link PIXI.Container#event:childAdded}
 * @memberof PIXI.ContainerEvents#
 * @member {Tuple<PIXI.DisplayObject, PIXI.Container, number>} childAdded
 */

/**
 * @see {@link PIXI.Container#event:childRemoved}
 * @memberof PIXI.ContainerEvents#
 * @member {Tuple<PIXI.DisplayObject, PIXI.Container, number>} childRemoved
 */
