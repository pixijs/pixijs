import { Point } from '../maths/point/Point';
import { FederatedEvent } from './FederatedEvent';

import type { PointData } from '../maths/point/PointData';
import type { Container } from '../scene/container/Container';
import type { PixiTouch } from './FederatedEvent';

/**
 * A specialized event class for mouse interactions in PixiJS applications.
 * Extends {@link FederatedEvent} to provide mouse-specific properties and methods
 * while maintaining compatibility with the DOM MouseEvent interface.
 *
 * Key features:
 * - Tracks mouse button states
 * - Provides modifier key states
 * - Supports coordinate systems (client, screen, global)
 * - Enables precise position tracking
 * @example
 * ```ts
 * // Basic mouse event handling
 * sprite.on('mousemove', (event: FederatedMouseEvent) => {
 *     // Get coordinates in different spaces
 *     console.log('Global position:', event.global.x, event.global.y);
 *     console.log('Client position:', event.client.x, event.client.y);
 *     console.log('Screen position:', event.screen.x, event.screen.y);
 *
 *     // Check button and modifier states
 *     if (event.buttons === 1 && event.ctrlKey) {
 *         console.log('Left click + Control key');
 *     }
 *
 *     // Get local coordinates relative to any container
 *     const localPos = event.getLocalPosition(container);
 *     console.log('Local position:', localPos.x, localPos.y);
 * });
 *
 * // Handle mouse button states
 * sprite.on('mousedown', (event: FederatedMouseEvent) => {
 *     console.log('Mouse button:', event.button); // 0=left, 1=middle, 2=right
 *     console.log('Active buttons:', event.buttons);
 * });
 * ```
 * @category events
 * @see {@link FederatedEvent} For base event functionality
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent} DOM MouseEvent Interface
 * @standard
 */
export class FederatedMouseEvent extends FederatedEvent<
MouseEvent | PointerEvent | PixiTouch
> implements MouseEvent
{
    /** Whether the "alt" key was pressed when this mouse event occurred. */
    public altKey: boolean;

    /** The specific button that was pressed in this mouse event. */
    public button: number;

    /** The button depressed when this event occurred. */
    public buttons: number;

    /** Whether the "control" key was pressed when this mouse event occurred. */
    public ctrlKey: boolean;

    /** Whether the "meta" key was pressed when this mouse event occurred. */
    public metaKey: boolean;

    /** This is currently not implemented in the Federated Events API. */
    public relatedTarget: EventTarget;

    /** Whether the "shift" key was pressed when this mouse event occurred. */
    public shiftKey: boolean;

    /** The coordinates of the mouse event relative to the canvas. */
    public client: Point = new Point();

    /** @readonly */
    public get clientX(): number { return this.client.x; }

    /** @readonly */
    public get clientY(): number { return this.client.y; }

    /**
     * Alias for {@link FederatedMouseEvent.clientX this.clientX}.
     * @readonly
     */
    get x(): number { return this.clientX; }

    /**
     * Alias for {@link FederatedMouseEvent.clientY this.clientY}.
     * @readonly
     */
    get y(): number { return this.clientY; }

    /** This is the number of clicks that occurs in 200ms/click of each other. */
    public detail: number;

    /** The movement in this pointer relative to the last `mousemove` event. */
    public movement: Point = new Point();

    /** @readonly */
    get movementX(): number { return this.movement.x; }

    /** @readonly */
    get movementY(): number { return this.movement.y; }

    /** The offset of the pointer coordinates w.r.t. target Container in world space. This is not supported at the moment. */
    public offset: Point = new Point();

    /** @readonly */
    get offsetX(): number { return this.offset.x; }

    /** @readonly */
    get offsetY(): number { return this.offset.y; }

    /** The pointer coordinates in world space. */
    public global: Point = new Point();

    /** @readonly */
    get globalX(): number { return this.global.x; }

    /** @readonly */
    get globalY(): number { return this.global.y; }

    /**
     * The pointer coordinates in the renderer's {@link AbstractRenderer.screen screen}. This has slightly
     * different semantics than native PointerEvent screenX/screenY.
     */
    public screen: Point = new Point();

    /**
     * The pointer coordinates in the renderer's screen. Alias for `screen.x`.
     * @readonly
     */
    get screenX(): number { return this.screen.x; }

    /**
     * The pointer coordinates in the renderer's screen. Alias for `screen.y`.
     * @readonly
     */
    get screenY(): number { return this.screen.y; }

    /**
     * Converts global coordinates into container-local coordinates.
     *
     * This method transforms coordinates from world space to a container's local space,
     * useful for precise positioning and hit testing.
     * @param container - The Container to get local coordinates for
     * @param point - Optional Point object to store the result. If not provided, a new Point will be created
     * @param globalPos - Optional custom global coordinates. If not provided, the event's global position is used
     * @returns The local coordinates as a Point object
     * @example
     * ```ts
     * // Basic usage - get local coordinates relative to a container
     * sprite.on('pointermove', (event: FederatedMouseEvent) => {
     *     // Get position relative to the sprite
     *     const localPos = event.getLocalPosition(sprite);
     *     console.log('Local position:', localPos.x, localPos.y);
     * });
     * // Using custom global coordinates
     * const customGlobal = new Point(100, 100);
     * sprite.on('pointermove', (event: FederatedMouseEvent) => {
     *     // Transform custom coordinates
     *     const localPos = event.getLocalPosition(sprite, undefined, customGlobal);
     *     console.log('Custom local position:', localPos.x, localPos.y);
     * });
     * ```
     * @see {@link Container.worldTransform} For the transformation matrix
     * @see {@link Point} For the point class used to store coordinates
     */
    public getLocalPosition<P extends PointData = Point>(container: Container, point?: P, globalPos?: PointData): P
    {
        return container.worldTransform.applyInverse<P>(globalPos || this.global, point);
    }

    /**
     * Whether the modifier key was pressed when this event natively occurred.
     * @param key - The modifier key.
     */
    public getModifierState(key: string): boolean
    {
        return 'getModifierState' in this.nativeEvent && this.nativeEvent.getModifierState(key);
    }

    /**
     * Not supported.
     * @param _typeArg
     * @param _canBubbleArg
     * @param _cancelableArg
     * @param _viewArg
     * @param _detailArg
     * @param _screenXArg
     * @param _screenYArg
     * @param _clientXArg
     * @param _clientYArg
     * @param _ctrlKeyArg
     * @param _altKeyArg
     * @param _shiftKeyArg
     * @param _metaKeyArg
     * @param _buttonArg
     * @param _relatedTargetArg
     * @deprecated since 7.0.0
     * @ignore
     */
    // eslint-disable-next-line max-params
    public initMouseEvent(
        _typeArg: string,
        _canBubbleArg: boolean,
        _cancelableArg: boolean,
        _viewArg: Window,
        _detailArg: number,
        _screenXArg: number,
        _screenYArg: number,
        _clientXArg: number,
        _clientYArg: number,
        _ctrlKeyArg: boolean,
        _altKeyArg: boolean,
        _shiftKeyArg: boolean,
        _metaKeyArg: boolean,
        _buttonArg: number,
        _relatedTargetArg: EventTarget
    ): void
    {
        throw new Error('Method not implemented.');
    }
}
