import { FederatedMouseEvent } from './FederatedMouseEvent';
import { FederatedPointerEvent } from './FederatedPointerEvent';
import { FederatedWheelEvent } from './FederatedWheelEvent';
import { Point } from '@pixi/math';

import type { Cursor, FederatedEventTarget } from './FederatedEventTarget';
import type { DisplayObject } from '@pixi/display';
import type { FederatedEvent } from './FederatedEvent';
// The maximum iterations used in propagation. This prevent infinite loops.
const PROPAGATION_LIMIT = 2048;

const tempHitLocation = new Point();
const tempLocalMapping = new Point();

/**
 * The tracking data for each display object.
 */
type TrackingData = {
    pressTargetsByButton: {
        [id: number]: FederatedEventTarget;
    };
    clicksByButton: {
        [id: number]: {
            clickCount: number;
            target: FederatedEventTarget;
            timeStamp: number;
        }
    };
    overTarget: FederatedEventTarget;
};

/**
 * Internal storage of event listeners in EventEmitter.
 *
 * @ignore
 */
type EmitterListeners = Record<string,
    | Array<{ fn(...args: any[]): any, context: any }>
    | { fn(...args: any[]): any, context: any }
>;

/**
 * Event boundaries are "barriers" where events coming from an upstream scene are modified before downstream propagation.
 *
 * ## Root event boundary
 *
 * The {@link PIXI.EventSystem#rootBoundary rootBoundary} handles events coming from the &lt;canvas /&gt;.
 * {@link PIXI.EventSystem} handles the normalization from native {@link https://dom.spec.whatwg.org/#event Events}
 * into {@link PIXI.FederatedEvent FederatedEvents}. The rootBoundary then does the hit-testing and event dispatch
 * for the upstream normalized event.
 *
 * ## Additional event boundaries
 *
 * An additional event boundary may be desired within an application's scene graph. For example, if a portion of the scene is
 * is flat with many children at one level - a spatial hash maybe needed to accelerate hit testing. In this scenario, the
 * container can be detached from the scene and glued using a custom event boundary.
 *
 * ```ts
 * import { Container } from '@pixi/display';
 * import { EventBoundary } from '@pixi/events';
 * import { SpatialHash } from 'pixi-spatial-hash';
 *
 * class HashedHitTestingEventBoundary
 * {
 *     private spatialHash: SpatialHash;
 *
 *     constructor(scene: Container, spatialHash: SpatialHash)
 *     {
 *         super(scene);
 *         this.spatialHash = spatialHash;
 *     }
 *
 *     hitTestRecursive(...)
 *     {
 *         // TODO: If target === this.rootTarget, then use spatial hash to get a
 *         // list of possible children that match the given (x,y) coordinates.
 *     }
 * }
 *
 * class VastScene extends DisplayObject
 * {
 *     protected eventBoundary: EventBoundary;
 *     protected scene: Container;
 *     protected spatialHash: SpatialHash;
 *
 *     constructor()
 *     {
 *         this.scene = new Container();
 *         this.spatialHash = new SpatialHash();
 *         this.eventBoundary = new HashedHitTestingEventBoundary(this.scene, this.spatialHash);
 *
 *         // Populate this.scene with a ton of children, while updating this.spatialHash
 *     }
 * }
 * ```
 *
 * @memberof PIXI
 */
export class EventBoundary
{
    /**
     * The root event-target residing below the event boundary.
     *
     * All events are dispatched trickling down and bubbling up to this `rootTarget`.
     */
    public rootTarget: DisplayObject;

    /**
     * The cursor preferred by the event targets underneath this boundary.
     */
    public cursor: Cursor;

    /**
     * This flag would emit `pointermove`, `touchmove`, and `mousemove` events on all DisplayObjects.
     *
     * The `moveOnAll` semantics mirror those of earlier versions of PixiJS. This was disabled in favor of
     * the Pointer Event API's approach.
     */
    public moveOnAll = false;

    /**
     * Maps event types to forwarding handles for them.
     *
     * {@link PIXI.EventBoundary EventBoundary} provides mapping for "pointerdown", "pointermove",
     * "pointerout", "pointerleave", "pointerover", "pointerup", and "pointerupoutside" by default.
     *
     * @see PIXI.EventBoundary#addEventMapping
     */
    protected mappingTable: Record<string, Array<{
        fn: (e: FederatedEvent) => void,
        priority: number
    }>>;

    /**
     * State object for mapping methods.
     *
     * @see PIXI.EventBoundary#trackingData
     */
    protected mappingState: Record<string, any> = {
        trackingData: {}
    };

    /**
     * @param rootTarget - The holder of the event boundary.
     */
    constructor(rootTarget?: DisplayObject)
    {
        this.rootTarget = rootTarget;

        this.hitPruneFn = this.hitPruneFn.bind(this);
        this.hitTestFn = this.hitTestFn.bind(this);
        this.mapPointerDown = this.mapPointerDown.bind(this);
        this.mapPointerMove = this.mapPointerMove.bind(this);
        this.mapPointerOut = this.mapPointerOut.bind(this);
        this.mapPointerOver = this.mapPointerOver.bind(this);
        this.mapPointerUp = this.mapPointerUp.bind(this);
        this.mapPointerUpOutside = this.mapPointerUpOutside.bind(this);
        this.mapWheel = this.mapWheel.bind(this);

        this.mappingTable = {};
        this.addEventMapping('pointerdown', this.mapPointerDown);
        this.addEventMapping('pointermove', this.mapPointerMove);
        this.addEventMapping('pointerout', this.mapPointerOut);
        this.addEventMapping('pointerleave', this.mapPointerOut);
        this.addEventMapping('pointerover', this.mapPointerOver);
        this.addEventMapping('pointerup', this.mapPointerUp);
        this.addEventMapping('pointerupoutside', this.mapPointerUpOutside);
        this.addEventMapping('wheel', this.mapWheel);
    }

    /**
     * Adds an event mapping for the event `type` handled by `fn`.
     *
     * Event mappings can be used to implement additional or custom events. They take an event
     * coming from the upstream scene (or directly from the {@link PIXI.EventSystem}) and dispatch new downstream events
     * generally trickling down and bubbling up to {@link PIXI.EventBoundary.rootTarget this.rootTarget}.
     *
     * To modify the semantics of existing events, the built-in mapping methods of EventBoundary should be overridden
     * instead.
     *
     * @param type - The type of upstream event to map.
     * @param fn - The mapping method. The context of this function must be bound manually, if desired.
     */
    public addEventMapping(type: string, fn: (e: FederatedEvent) => void): void
    {
        if (!this.mappingTable[type])
        {
            this.mappingTable[type] = [];
        }

        this.mappingTable[type].push({
            fn,
            priority: 0,
        });
        this.mappingTable[type].sort((a, b) => a.priority - b.priority);
    }

    /** Dispatches the given event */
    public dispatchEvent(e: FederatedEvent, type?: string): void
    {
        e.propagationStopped = false;
        e.propagationImmediatelyStopped = false;

        this.propagate(e, type);
    }

    /** Maps the given upstream event through the event boundary and propagates it downstream. */
    public mapEvent(e: FederatedEvent): void
    {
        if (!this.rootTarget)
        {
            return;
        }

        const mappers = this.mappingTable[e.type];

        if (mappers)
        {
            for (let i = 0, j = mappers.length; i < j; i++)
            {
                mappers[i].fn(e);
            }
        }
        else
        {
            console.warn(`[EventBoundary]: Event mapping not defined for ${e.type}`);
        }
    }

    /**
     * Finds the DisplayObject that is the target of a event at the given coordinates.
     *
     * The passed (x,y) coordinates are in the world space above this event boundary.
     */
    public hitTest(
        x: number,
        y: number,
    ): DisplayObject
    {
        const invertedPath = this.hitTestRecursive(
            this.rootTarget,
            this.rootTarget.interactive,
            tempHitLocation.set(x, y),
            this.hitTestFn,
            this.hitPruneFn,
        );

        return invertedPath && invertedPath[0];
    }

    /**
     * Propagate the passed event from from {@link EventBoundary.rootTarget this.rootTarget} to its
     * target {@code e.target}.
     *
     * @param e - The event to propagate.
     */
    public propagate(e: FederatedEvent, type?: string): void
    {
        if (!e.target)
        {
            // This usually occurs when the scene graph is not interactive.
            return;
        }

        const composedPath = e.composedPath();

        // Capturing phase
        e.eventPhase = e.CAPTURING_PHASE;

        for (let i = 0, j = composedPath.length - 1; i < j; i++)
        {
            e.currentTarget = composedPath[i];

            this.notifyTarget(e, type);

            if (e.propagationStopped || e.propagationImmediatelyStopped) return;
        }

        // At target phase
        e.eventPhase = e.AT_TARGET;
        e.currentTarget = e.target;

        this.notifyTarget(e, type);

        if (e.propagationStopped || e.propagationImmediatelyStopped) return;

        // Bubbling phase
        e.eventPhase = e.BUBBLING_PHASE;

        for (let i = composedPath.length - 2; i >= 0; i--)
        {
            e.currentTarget = composedPath[i];

            this.notifyTarget(e, type);

            if (e.propagationStopped || e.propagationImmediatelyStopped) return;
        }
    }

    /**
     * Emits the event {@link e} to all display objects. The event is propagated in the bubbling phase at all
     * times.
     *
     * This is used in the `pointermove` legacy mode.
     *
     * @param e - The emitted event.
     * @param type - The listeners to notify.
     */
    public all(e: FederatedEvent, type?: string, target: FederatedEventTarget = this.rootTarget): void
    {
        e.eventPhase = e.BUBBLING_PHASE;

        const children = target.children;

        if (children)
        {
            for (let i = 0; i < children.length; i++)
            {
                this.all(e, type, children[i]);
            }
        }

        e.currentTarget = target;
        this.notifyTarget(e, type);
    }

    /**
     * Finds the propagation path from {@link PIXI.EventBoundary.rootTarget rootTarget} to the passed
     * {@code target}. The last element in the path is {@code target}.
     *
     * @param target
     */
    public propagationPath(target: FederatedEventTarget): FederatedEventTarget[]
    {
        const propagationPath = [target];

        for (let i = 0; i < PROPAGATION_LIMIT && target !== this.rootTarget; i++)
        {
            if (!target.parent)
            {
                throw new Error('Cannot find propagation path to disconnected target');
            }

            propagationPath.push(target.parent);

            target = target.parent;
        }

        propagationPath.reverse();

        return propagationPath;
    }

    /**
     * Recursive implementation for {@link EventBoundary.hitTest hitTest}.
     *
     * @param currentTarget - The DisplayObject that is to be hit tested.
     * @param interactive - Flags whether `currentTarget` or one of its parents are interactive.
     * @param location - The location that is being tested for overlap.
     * @param testFn - Callback that determines whether the target passes hit testing. This callback
     *  can assume that `pruneFn` failed to prune the display object.
     * @param pruneFn - Callback that determiness whether the target and all of its children
     *  cannot pass the hit test. It is used as a preliminary optimization to prune entire subtrees
     *  of the scene graph.
     * @return An array holding the hit testing target and all its ancestors in order. The first element
     *  is the target itself and the last is {@link EventBoundary.rootTarget rootTarget}. This is the opposite
     *  order w.r.t. the propagation path. If no hit testing target is found, null is returned.
     */
    protected hitTestRecursive(
        currentTarget: DisplayObject,
        interactive: boolean,
        location: Point,
        testFn: (object: DisplayObject, pt: Point) => boolean,
        pruneFn?: (object: DisplayObject, pt: Point) => boolean,
    ): DisplayObject[]
    {
        if (!currentTarget || !currentTarget.visible)
        {
            return null;
        }

        // Attempt to prune this DisplayObject and its subtree as an optimization.
        if (pruneFn(currentTarget, location))
        {
            return null;
        }

        // Find a child that passes the hit testing and return one, if any.
        if (currentTarget.interactiveChildren && currentTarget.children)
        {
            const children = currentTarget.children;

            for (let i = children.length - 1; i >= 0; i--)
            {
                const child = children[i] as DisplayObject;

                const nestedHit = this.hitTestRecursive(
                    child,
                    interactive || child.interactive,
                    location,
                    testFn,
                    pruneFn,
                );

                if (nestedHit)
                {
                    // Its a good idea to check if a child has lost its parent.
                    // this means it has been removed whilst looping so its best
                    if (!nestedHit[nestedHit.length - 1].parent)
                    {
                        continue;
                    }

                    nestedHit.push(currentTarget);

                    return nestedHit;
                }
            }
        }

        // Finally, hit test this DisplayObject itself.
        if (interactive && testFn(currentTarget, location))
        {
            return [currentTarget];
        }

        return null;
    }

    /**
     * Checks whether the display object or any of its children cannot pass the hit test at all.
     *
     * {@link EventBoundary}'s implementation uses the {@link PIXI.DisplayObject.hitArea hitArea}
     * and {@link PIXI.DisplayObject._mask} for pruning.
     *
     * @param displayObject
     * @param location
     */
    protected hitPruneFn(displayObject: DisplayObject, location: Point): boolean
    {
        if (displayObject.hitArea)
        {
            displayObject.worldTransform.applyInverse(location, tempLocalMapping);

            if (!displayObject.hitArea.contains(tempLocalMapping.x, tempLocalMapping.y))
            {
                return true;
            }
        }

        if (displayObject._mask)
        {
            const mask = displayObject._mask as any;

            if (!(mask.containsPoint && mask.containsPoint(location)))
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks whether the display object passes hit testing for the given location.
     *
     * @param displayObject
     * @param location
     * @return - Whether `displayObject` passes hit testing for `location`.
     */
    protected hitTestFn(displayObject: DisplayObject, location: Point): boolean
    {
        // If the display object failed pruning with a hitArea, then it must pass it.
        if (displayObject.hitArea)
        {
            return true;
        }

        if ((displayObject as any).containsPoint)
        {
            return (displayObject as any).containsPoint(location) as boolean;
        }

        // TODO: Should we hit test based on bounds?

        return false;
    }

    /**
     * Notify all the listeners to the event's `currentTarget`.
     *
     * @param e - The event passed to the target.
     */
    protected notifyTarget(e: FederatedEvent, type?: string): void
    {
        type = type ?? e.type;
        const key = e.eventPhase === e.CAPTURING_PHASE || e.eventPhase === e.AT_TARGET ? `${type}capture` : type;

        this.notifyListeners(e, key);

        if (e.eventPhase === e.AT_TARGET)
        {
            this.notifyListeners(e, type);
        }
    }

    /**
     * Maps the upstream `pointerdown` events to a downstream `pointerdown` event.
     *
     * `touchstart`, `rightdown`, `mousedown` events are also dispatched for specific pointer types.
     *
     * @param from
     */
    protected mapPointerDown(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const e = this.createPointerEvent(from);

        this.dispatchEvent(e, 'pointerdown');

        if (e.pointerType === 'touch')
        {
            this.dispatchEvent(e, 'touchstart');
        }
        else if (e.pointerType === 'mouse' || e.pointerType === 'pen')
        {
            const isRightButton = e.button === 2;

            this.dispatchEvent(e, isRightButton ? 'rightdown' : 'mousedown');
        }

        const trackingData = this.trackingData(from.pointerId);

        trackingData.pressTargetsByButton[from.button] = e.target;
    }

    /**
     * Maps the upstream `pointermove` to downstream `pointerout`, `pointerover`, and `pointermove` events, in that order.
     *
     * The tracking data for the specific pointer has an updated `overTarget`. `mouseout`, `mouseover`,
     * `mousemove`, and `touchmove` events are fired as well for specific pointer types.
     *
     * @param from - The upstream `pointermove` event.
     */
    protected mapPointerMove(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const e = this.createPointerEvent(from);
        const isMouse = e.pointerType === 'mouse' || e.pointerType === 'pen';
        const trackingData = this.trackingData(from.pointerId);

        // First pointerout/pointerleave
        if (trackingData.overTarget && trackingData.overTarget !== e.target)
        {
            // pointerout always occurs on the overTarget when the pointer hovers over another element.
            const outType = from.type === 'mousemove' ? 'mouseout' : 'pointerout';
            const outEvent = this.createPointerEvent(from, outType, trackingData.overTarget);

            this.dispatchEvent(outEvent, 'pointerout');
            if (isMouse) this.dispatchEvent(outEvent, 'mouseout');

            // If the pointer exits overTarget and its descendants, then a pointerleave event is also fired. This event
            // is dispatched to all ancestors that no longer capture the pointer.
            if (!e.composedPath().includes(trackingData.overTarget))
            {
                const leaveEvent = this.createPointerEvent(from, 'pointerleave', trackingData.overTarget);

                leaveEvent.eventPhase = leaveEvent.AT_TARGET;

                while (leaveEvent.target && !e.composedPath().includes(leaveEvent.target))
                {
                    leaveEvent.currentTarget = leaveEvent.target;

                    this.notifyTarget(leaveEvent);
                    if (isMouse) this.notifyTarget(leaveEvent, 'mouseleave');

                    leaveEvent.target = leaveEvent.target.parent;
                }
            }
        }

        // Then pointerover
        if (trackingData.overTarget !== e.target)
        {
            // pointerover always occurs on the new overTarget
            const overType = from.type === 'mousemove' ? 'mouseover' : 'pointerover';
            const overEvent = this.cloneEvent(e, overType);// clone faster

            this.dispatchEvent(overEvent, 'pointerover');
            if (isMouse) this.dispatchEvent(overEvent, 'mouseover');

            // Probe whether the newly hovered DisplayObject is an ancestor of the original overTarget.
            let overTargetAncestor = trackingData.overTarget?.parent;

            while (overTargetAncestor && overTargetAncestor !== this.rootTarget.parent)
            {
                if (overTargetAncestor === e.target) break;

                overTargetAncestor = overTargetAncestor.parent;
            }

            // The pointer has entered a non-ancestor of the original overTarget. This means we need a pointerentered
            // event.
            const didPointerEnter = !overTargetAncestor || overTargetAncestor === this.rootTarget.parent;

            if (didPointerEnter)
            {
                const enterEvent = this.cloneEvent(e, 'pointerenter');

                enterEvent.eventPhase = enterEvent.AT_TARGET;

                while (enterEvent.target
                        && enterEvent.target !== trackingData.overTarget
                        && enterEvent.target !== this.rootTarget.parent)
                {
                    enterEvent.currentTarget = enterEvent.target;

                    this.notifyTarget(enterEvent);
                    if (isMouse) this.notifyTarget(enterEvent, 'mouseenter');

                    enterEvent.target = enterEvent.target.parent;
                }
            }
        }

        const propagationMethod = this.moveOnAll ? 'all' : 'dispatchEvent';

        // Then pointermove
        this[propagationMethod](e, 'pointermove');

        if (e.pointerType === 'touch') this[propagationMethod](e, 'touchmove');

        if (isMouse)
        {
            this[propagationMethod](e, 'mousemove');
            this.cursor = e.target?.cursor;
        }

        trackingData.overTarget = e.target;
    }

    /**
     * Maps the upstream `pointerover` to a downstream `pointerover` event.
     *
     * The tracking data for the specific pointer gets a new `overTarget`.
     *
     * @param from - The upstream `pointerover` event.
     */
    protected mapPointerOver(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const trackingData = this.trackingData(from.pointerId);
        const e = this.createPointerEvent(from);
        const isMouse = e.pointerType === 'mouse' || e.pointerType === 'pen';

        this.dispatchEvent(e, 'pointerover');
        if (isMouse) this.dispatchEvent(e, 'mouseover');
        if (e.pointerType === 'mouse') this.cursor = e.target?.cursor;

        // pointerenter events must be fired since the pointer entered from upstream.
        const enterEvent = this.cloneEvent(e, 'pointerenter');

        enterEvent.eventPhase = enterEvent.AT_TARGET;

        while (enterEvent.target && enterEvent.target !== this.rootTarget.parent)
        {
            enterEvent.currentTarget = enterEvent.target;

            this.notifyTarget(enterEvent);
            if (isMouse) this.notifyTarget(enterEvent, 'mouseenter');

            enterEvent.target = enterEvent.target.parent;
        }

        trackingData.overTarget = e.target;
    }

    /**
     * Maps the upstream `pointerout` to a downstream `pointerout` event.
     *
     * The tracking data for the specific pointer is cleared of a `overTarget`.
     *
     * @param from - The upstream `pointerout` event.
     */
    protected mapPointerOut(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const trackingData = this.trackingData(from.pointerId);

        if (trackingData.overTarget)
        {
            const isMouse = from.pointerType === 'mouse' || from.pointerType === 'pen';

            // pointerout first
            const outEvent = this.createPointerEvent(from, 'pointerout', trackingData.overTarget);

            this.dispatchEvent(outEvent);
            if (isMouse) this.dispatchEvent(outEvent, 'mouseout');

            // pointerleave(s) are also dispatched b/c the pointer must've left rootTarget and its descendants to
            // get an upstream pointerout event (upstream events do not know rootTarget has descendants).
            const leaveEvent = this.createPointerEvent(from, 'pointerleave', trackingData.overTarget);

            leaveEvent.eventPhase = leaveEvent.AT_TARGET;

            while (leaveEvent.target && leaveEvent.target !== this.rootTarget.parent)
            {
                leaveEvent.currentTarget = leaveEvent.target;

                this.notifyTarget(leaveEvent);
                if (isMouse) this.notifyTarget(leaveEvent, 'mouseleave');

                leaveEvent.target = leaveEvent.target.parent;
            }

            trackingData.overTarget = null;
        }

        this.cursor = null;
    }

    /**
     * Maps the upstream `pointerup` event to downstream `pointerup`, `pointerupoutside`, and `click`/`pointertap` events,
     * in that order.
     *
     * The `pointerupoutside` event bubbles from the original `pointerdown` target to the most specific
     * ancestor of the `pointerdown` and `pointerup` targets, which is also the `click` event's target. `touchend`,
     * `rightup`, `mouseup`, `touchendoutside`, `rightupoutside`, `mouseupoutside`, and `tap` are fired as well for
     * specific pointer types.
     *
     * @param from - The upstream `pointerup` event.
     */
    protected mapPointerUp(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const now = performance.now();
        const e = this.createPointerEvent(from);

        this.dispatchEvent(e, 'pointerup');

        if (e.pointerType === 'touch')
        {
            this.dispatchEvent(e, 'touchend');
        }
        else if (e.pointerType === 'mouse' || e.pointerType === 'pen')
        {
            const isRightButton = e.button === 2;

            this.dispatchEvent(e, isRightButton ? 'rightup' : 'mouseup');
        }

        const trackingData = this.trackingData(from.pointerId);
        const pressTarget = trackingData.pressTargetsByButton[from.button];

        let clickTarget = pressTarget;

        // pointerupoutside only bubbles. It only bubbles upto the parent that doesn't contain
        // the pointerup location.
        if (pressTarget && !e.composedPath().includes(pressTarget))
        {
            let currentTarget = pressTarget;

            while (currentTarget && !e.composedPath().includes(currentTarget))
            {
                e.currentTarget = currentTarget;

                this.notifyTarget(e, 'pointerupoutside');

                if (e.pointerType === 'touch')
                {
                    this.notifyTarget(e, 'touchendoutside');
                }
                else if (e.pointerType === 'mouse' || e.pointerType === 'pen')
                {
                    const isRightButton = e.button === 2;

                    this.notifyTarget(e, isRightButton ? 'rightupoutside' : 'mouseupoutside');
                }

                currentTarget = currentTarget.parent;
            }

            delete trackingData.pressTargetsByButton[from.button];

            // currentTarget is the most specific ancestor holding both the pointerdown and pointerup
            // targets. That is - it's our click target!
            clickTarget = pressTarget;
        }

        // click!
        if (clickTarget)
        {
            const clickEvent = this.cloneEvent(e, 'click');

            clickEvent.target = clickTarget;
            clickEvent.path = null;

            if (!trackingData.clicksByButton[from.button])
            {
                trackingData.clicksByButton[from.button] = {
                    clickCount: 0,
                    target: clickEvent.target,
                    timeStamp: now,
                };
            }

            const clickHistory = trackingData.clicksByButton[from.button];

            if (clickHistory.target === clickEvent.target
                && now - clickHistory.timeStamp < 200)
            {
                ++clickHistory.clickCount;
            }
            else
            {
                clickHistory.clickCount = 1;
            }

            clickHistory.target = clickEvent.target;
            clickHistory.timeStamp = now;

            clickEvent.detail = clickHistory.clickCount;

            if (clickEvent.pointerType === 'mouse')
            {
                this.dispatchEvent(clickEvent, 'click');
            }
            else if (clickEvent.pointerType === 'touch')
            {
                this.dispatchEvent(clickEvent, 'tap');
            }
            else
            {
                this.dispatchEvent(clickEvent, 'pointertap');
            }
        }
    }

    /**
     * Maps the upstream `pointerupoutside` event to a downstream `pointerupoutside` event, bubbling from the original
     * `pointerdown` target to `rootTarget`.
     *
     * (The most specific ancestor of the `pointerdown` event and the `pointerup` event must the {@code EventBoundary}'s
     * root because the `pointerup` event occurred outside of the boundary.)
     *
     * `touchendoutside`, `mouseupoutside`, and `rightupoutside` events are fired as well for specific pointer
     * types. The tracking data for the specific pointer is cleared of a `pressTarget`.
     *
     * @param from - The upstream `pointerupoutside` event.
     */
    protected mapPointerUpOutside(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent))
        {
            console.warn('EventBoundary cannot map a non-pointer event as a pointer event');

            return;
        }

        const trackingData = this.trackingData(from.pointerId);
        const pressTarget = trackingData.pressTargetsByButton[from.button];
        const e = this.createPointerEvent(from);

        if (pressTarget)
        {
            let currentTarget = pressTarget;

            while (currentTarget)
            {
                e.currentTarget = currentTarget;

                this.notifyTarget(e, 'pointerupoutside');

                if (e.pointerType === 'touch')
                {
                    this.notifyTarget(e, 'touchendoutside');
                }
                else if (e.pointerType === 'mouse' || e.pointerType === 'pen')
                {
                    this.notifyTarget(e, e.button === 2 ? 'rightupoutside' : 'mouseupoutside');
                }

                currentTarget = currentTarget.parent;
            }

            delete trackingData.pressTargetsByButton[from.button];
        }
    }

    /**
     * Maps the upstream `wheel` event to a downstream `wheel` event.
     *
     * @param from - The upstream `wheel` event.
     */
    protected mapWheel(from: FederatedEvent): void
    {
        if (!(from instanceof FederatedWheelEvent))
        {
            console.warn('EventBoundary cannot map a non-wheel event as a wheel event');

            return;
        }

        this.dispatchEvent(this.createWheelEvent(from));
    }

    /**
     * Creates an event whose {@code originalEvent} is {@code from}, with an optional `type` and `target` override.
     *
     * @param from - The {@code originalEvent} for the returned event.
     * @param [type=from.type] - The type of the returned event.
     * @param target - The target of the returned event.
     */
    protected createPointerEvent(
        from: FederatedPointerEvent,
        type?: string,
        target?: FederatedEventTarget
    ): FederatedPointerEvent
    {
        target = target ?? this.hitTest(from.global.x, from.global.y) as FederatedEventTarget;

        const event = new FederatedPointerEvent(this);

        event.nativeEvent = from.nativeEvent;
        event.originalEvent = from;
        event.target = target;

        this.copyPointerData(from, event);
        this.copyMouseData(from, event);
        this.copyData(from, event);

        if (typeof type === 'string')
        {
            event.type = type;
        }

        return event;
    }

    /**
     * Creates a wheel event whose {@code originalEvent} is {@code from}.
     *
     * @param from - The upstream wheel event.
     */
    protected createWheelEvent(from: FederatedWheelEvent): FederatedWheelEvent
    {
        const event = new FederatedWheelEvent(this);

        event.nativeEvent = from.nativeEvent;
        event.originalEvent = from;
        event.target = this.hitTest(from.global.x, from.global.y);

        this.copyWheelData(from, event);
        this.copyMouseData(from, event);
        this.copyData(from, event);

        return event;
    }

    /**
     * Clones the event {@code from}, with an optional {@code type} override.
     *
     * @param from - The event to clone.
     * @param [type=from.type] - The type of the returned event.
     */
    protected cloneEvent(from: FederatedPointerEvent, type?: string): FederatedPointerEvent
    {
        const event = new FederatedPointerEvent(this);

        event.nativeEvent = from.nativeEvent;
        event.originalEvent = from.originalEvent;

        this.copyPointerData(from, event);
        this.copyMouseData(from, event);
        this.copyData(from, event);

        // copy propagation path for perf
        event.target = from.target;
        event.path = from.composedPath().slice();
        event.type = type ?? event.type;

        return event;
    }

    /**
     * Copies wheel {@link PIXI.FederatedWheelEvent} data from {@code from} into {@code to}.
     *
     * The following properties are copied:
     * + deltaMode
     * + deltaX
     * + deltaY
     * + deltaZ
     *
     * @param from
     * @param to
     */
    protected copyWheelData(from: FederatedWheelEvent, to: FederatedWheelEvent): void
    {
        to.deltaMode = from.deltaMode;
        to.deltaX = from.deltaX;
        to.deltaY = from.deltaY;
        to.deltaZ = from.deltaZ;
    }

    /**
     * Copies pointer {@link PIXI.FederatedPointerEvent} data from {@code from} into {@code to}.
     *
     * The following properties are copied:
     * + pointerId
     * + width
     * + height
     * + isPrimary
     * + pointerType
     * + pressure
     * + tangentialPressure
     * + tiltX
     * + tiltY
     *
     * @param from
     * @param to
     */
    protected copyPointerData(from: FederatedEvent, to: FederatedEvent): void
    {
        if (!(from instanceof FederatedPointerEvent && to instanceof FederatedPointerEvent)) return;

        to.pointerId = from.pointerId;
        to.width = from.width;
        to.height = from.height;
        to.isPrimary = from.isPrimary;
        to.pointerType = from.pointerType;
        to.pressure = from.pressure;
        to.tangentialPressure = from.tangentialPressure;
        to.tiltX = from.tiltX;
        to.tiltY = from.tiltY;
        to.twist = from.twist;
    }

    /**
     * Copies mouse {@link PIXI.FederatedMouseEvent} data from {@code from} to {@code to}.
     *
     * The following properties are copied:
     * + altKey
     * + button
     * + buttons
     * + clientX
     * + clientY
     * + metaKey
     * + movementX
     * + movementY
     * + pageX
     * + pageY
     * + x
     * + y
     * + screen
     * + global
     *
     * @param from
     * @param to
     */
    protected copyMouseData(from: FederatedEvent, to: FederatedEvent): void
    {
        if (!(from instanceof FederatedMouseEvent && to instanceof FederatedMouseEvent)) return;

        to.altKey = from.altKey;
        to.button = from.button;
        to.buttons = from.buttons;
        to.client.copyFrom(from.client);
        to.ctrlKey = from.ctrlKey;
        to.metaKey = from.metaKey;
        to.movement.copyFrom(from.movement);

        to.screen.copyFrom(from.screen);
        to.global.copyFrom(from.global);
    }

    /**
     * Copies base {@link PIXI.FederatedEvent} data from {@code from} into {@code to}.
     *
     * The following properties are copied:
     * + isTrusted
     * + srcElement
     * + timeStamp
     * + type
     *
     * @param from - The event to copy data from.
     * @param to - The event to copy data into.
     */
    protected copyData(from: FederatedEvent, to: FederatedEvent): void
    {
        to.isTrusted = from.isTrusted;
        to.srcElement = from.srcElement;
        to.timeStamp = performance.now();
        to.type = from.type;
        to.detail = from.detail;
        to.view = from.view;
        to.which = from.which;
        to.layer.copyFrom(from.layer);
        to.page.copyFrom(from.page);
    }

    /**
     * @param id - The pointer ID.
     * @return The tracking data stored for the given pointer. If no data exists, a blank
     *  state will be created.
     */
    protected trackingData(id: number): TrackingData
    {
        if (!this.mappingState.trackingData[id])
        {
            this.mappingState.trackingData[id] = {
                pressTargetsByButton: {},
                clicksByButton: {},
                overTarget: null
            };
        }

        return this.mappingState.trackingData[id];
    }

    /**
     * Similar to {@link EventEmitter.emit}, except it stops if the `propagationImmediatelyStopped` flag
     * is set on the event.
     *
     * @param e - The event to call each listener with.
     * @param type - The event key.
     */
    private notifyListeners(e: FederatedEvent, type: string): void
    {
        const listeners = ((e.currentTarget as any)._events as EmitterListeners)[type];

        if (!listeners) return;

        if ('fn' in listeners)
        {
            listeners.fn.call(listeners.context, e);
        }
        else
        {
            for (
                let i = 0, j = listeners.length;
                i < j && !e.propagationImmediatelyStopped;
                i++)
            {
                listeners[i].fn.call(listeners[i].context, e);
            }
        }
    }
}

/**
 * Fired when a mouse button (usually a mouse left-button) is pressed on the display.
 * object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#mousedown
 * @param {PIXI.FederatedPointerEvent} event - The mousedown event.
 */

/**
 * Capture phase equivalent of {@code mousedown}.
 *
 * @event PIXI.DisplayObject#mousedowncapture
 * @param {PIXI.FederatedPointerEvent} event - The capture phase mousedown.
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
 * on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#rightdown
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightdown}.
 *
 * @event PIXI.DisplayObject#rightdowncapture
 * @param {PIXI.FederatedPointerEvent} event - The rightdowncapture event.
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is released over the display
 * object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#mouseup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseup}.
 *
 * @event PIXI.DisplayObject#mouseupcature
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is released
 * over the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#rightup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightup}.
 *
 * @event PIXI.DisplayObject#rightupcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
 * the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * A {@code click} event fires after the {@code pointerdown} and {@code pointerup} events, in that
 * order. If the mouse is moved over another DisplayObject after the {@code pointerdown} event, the
 * {@code click} event is fired on the most specific common ancestor of the two target DisplayObjects.
 *
 * The {@code detail} property of the event is the number of clicks that occurred within a 200ms
 * window of each other upto the current click. For example, it will be {@code 2} for a double click.
 *
 * @event PIXI.DisplayObject#click
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code click}.
 *
 * @event PIXI.DisplayObject#clickcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
 * and released on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * This event follows the semantics of {@code click}.
 *
 * @event PIXI.DisplayObject#rightclick
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightclick}.
 *
 * @event PIXI.DisplayObject#rightclickcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button (usually a mouse left-button) is released outside the
 * display object that initially registered a
 * [mousedown]{@link PIXI.DisplayObject#event:mousedown}.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
 * other events. It only bubbles to the most specific ancestor of the targets of the corresponding {@code pointerdown}
 * and {@code pointerup} events, i.e. the target of the {@code click} event.
 *
 * @event PIXI.DisplayObject#mouseupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseupoutside}.
 *
 * @event PIXI.DisplayObject#mouseupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device secondary button (usually a mouse right-button) is released
 * outside the display object that initially registered a
 * [rightdown]{@link PIXI.DisplayObject#event:rightdown}.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#rightupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code rightupoutside}.
 *
 * @event PIXI.DisplayObject#rightupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved while over the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#mousemove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mousemove}.
 *
 * @event PIXI.DisplayObject#mousemovecature
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved onto the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#mouseover
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseover}.
 *
 * @event PIXI.DisplayObject#mouseovercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the mouse pointer is moved over a DisplayObject and its descendant's hit testing boundaries.
 *
 * @event PIXI.DisplayObject#mouseenter
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseenter}
 *
 * @event PIXI.DisplayObject#mouseentercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device (usually a mouse) is moved off the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * This may be fired on a DisplayObject that was removed from the scene graph immediately after
 * a {@code mouseover} event.
 *
 * @event PIXI.DisplayObject#mouseout
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code mouseout}.
 *
 * @event PIXI.DisplayObject#mouseoutcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the mouse pointer exits a DisplayObject and its descendants.
 *
 * @event PIXI.DisplayObject#mouseleave
 * @param {PIXI.FederatedPointerEvent} event
 */

/**
 * Capture phase equivalent of {@code mouseleave}.
 *
 * @event PIXI.DisplayObject#mouseleavecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is pressed on the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointerdown
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerdown}.
 *
 * @event PIXI.DisplayObject#pointerdowncapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is released over the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointerup
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerup}.
 *
 * @event PIXI.DisplayObject#pointerupcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the operating system cancels a pointer event.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointercancel
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointercancel}.
 *
 * @event PIXI.DisplayObject#pointercancelcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is pressed and released on the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointertap
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointertap}.
 *
 * @event PIXI.DisplayObject#pointertapcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device button is released outside the display object that initially
 * registered a [pointerdown]{@link PIXI.DisplayObject#event:pointerdown}.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
 * other events. It only bubbles to the most specific ancestor of the targets of the corresponding {@code pointerdown}
 * and {@code pointerup} events, i.e. the target of the {@code click} event.
 *
 * @event PIXI.DisplayObject#pointerupoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerupoutside}.
 *
 * @event PIXI.DisplayObject#pointerupoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved while over the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointermove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointermove}.
 *
 * @event PIXI.DisplayObject#pointermovecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved onto the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointerover
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerover}.
 *
 * @event PIXI.DisplayObject#pointerovercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the pointer is moved over a DisplayObject and its descendant's hit testing boundaries.
 *
 * @event PIXI.DisplayObject#pointerenter
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerenter}
 *
 * @event PIXI.DisplayObject#pointerentercapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a pointer device is moved off the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#pointerout
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code pointerout}.
 *
 * @event PIXI.DisplayObject#pointeroutcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the pointer leaves the hit testing boundaries of a DisplayObject and its descendants.
 *
 * This event notifies only the target and does not bubble.
 *
 * @event PIXI.DisplayObject#pointerleave
 * @param {PIXI.FederatedPointerEvent} event - The `pointerleave` event.
 */

/**
 * Capture phase equivalent of {@code pointerleave}.
 *
 * @event PIXI.DisplayObject#pointerleavecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is placed on the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#touchstart
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchstart}.
 *
 * @event PIXI.DisplayObject#touchstartcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is removed from the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#touchend
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchend}.
 *
 * @event PIXI.DisplayObject#touchendcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when the operating system cancels a touch.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#touchcancel
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchcancel}.
 *
 * @event PIXI.DisplayObject#touchcancelcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is placed and removed from the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#tap
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code tap}.
 *
 * @event PIXI.DisplayObject#tapcapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is removed outside of the display object that initially
 * registered a [touchstart]{@link PIXI.DisplayObject#event:touchstart}.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#touchendoutside
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchendoutside}.
 *
 * @event PIXI.DisplayObject#touchendoutsidecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a touch point is moved along the display object.
 * DisplayObject's `interactive` property must be set to `true` to fire event.
 *
 * @event PIXI.DisplayObject#touchmove
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Capture phase equivalent of {@code touchmove}.
 *
 * @event PIXI.DisplayObject#touchmovecapture
 * @param {PIXI.FederatedPointerEvent} event - Event
 */

/**
 * Fired when a the user scrolls with the mouse cursor over a DisplayObject.
 * 
 * @event PIXI.DisplayObject#wheel
 * @type {PIXI.FederatedWheelEvent}
 */

/**
 * Capture phase equivalent of {@code wheel}.
 * 
 * @event PIXI.DisplayObject#wheelcapture
 * @type {PIXI.FederatedWheelEvent}
 */
