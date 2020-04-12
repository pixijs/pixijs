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
 * @see {@link event:PIXI.DisplayObject#added}
 * @memberof PIXI.DisplayObjectEvents#
 * @member {Tuple<PIXI.Container>} added
 */

/**
 * @see {@link event:PIXI.DisplayObject#removed}
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
 * @see {@link event:PIXI.Container#childAdded}
 * @memberof PIXI.ContainerEvents#
 * @member {Tuple<PIXI.DisplayObject, PIXI.Container, number>} childAdded
 */

/**
 * @see {@link event:PIXI.Container#childRemoved}
 * @memberof PIXI.ContainerEvents#
 * @member {Tuple<PIXI.DisplayObject, PIXI.Container, number>} childRemoved
 */
