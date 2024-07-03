import { EventsTicker } from '../events/EventTicker';
import { ExtensionType } from '../extensions/Extensions';
import { Point } from '../maths/point/Point';
import { warn } from '../utils/logging/warn';
import { applyInputEventsCompatibility } from './compatibilityLayer';
import { InputEvent } from './InputEvent';
import { copyData } from './utils/copy';
import { hitTestFn, isRenderable, prune } from './utils/prune';

import type { ExtensionMetadata } from '../extensions/Extensions';
import type { PointData } from '../maths/point/PointData';
import type { System } from '../rendering/renderers/shared/system/System';
import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';
import type { Input } from './Input';

/** The system for handling UI input. */
export class InputSystem implements System
{
    /** @ignore */
    public static extension: ExtensionMetadata = {
        name: 'input',
        type: [ExtensionType.WebGLSystem, ExtensionType.CanvasSystem, ExtensionType.WebGPUSystem],
        priority: -2,
    };

    /**
     * Should default browser actions automatically be prevented.
     * Does not apply to pointer events for backwards compatibility
     * preventDefault on pointer events stops mouse events from firing
     * Thus, for every pointer event, there will always be either a mouse of touch event alongside it.
     * @default true
     */
    public autoPreventDefault = true;

    /**
     * Dictionary of how different cursor modes are handled. Strings are handled as CSS cursor
     * values, objects are handled as dictionaries of CSS values for {@code domElement},
     * Default CSS cursor values are provided for 'default' and 'pointer' modes.
     */
    public cursorStyles: Record<string, string | CSSStyleDeclaration> = {
        default: 'inherit',
        pointer: 'pointer',
    };

    /**
     * The DOM element to which the root event listeners are bound. This is automatically set to
     * the renderer's {@link Renderer#view view}.
     */
    public domElement: HTMLElement = null;

    /** The resolution used to convert between the DOM client space into world space. */
    public resolution = 1;

    /** The renderer managing this {@link EventSystem}. */
    public renderer: Renderer;

    public ignoreHitTestCache = false;
    public ignoreDynamicEvents = true;

    protected _eventsAdded = false;
    protected _rootPointerEvent: InputEvent = new InputEvent();
    protected _currentCursor: string | object = null;
    protected _preferredCursor: string | object = null;

    protected _cachedHitTests: Record<`${string},${string}`, Container[]> = {};
    protected _seenCount = 0;
    protected _interactiveCount = 0;

    protected _trackedData: Record<
    number,
    {
        pressTargetsByButton: {
            [id: number]: Container[];
        };
        clicksByButton: {
            [id: number]: {
                clickCount: number;
                target: Container;
                timeStamp: number;
            };
        };
        overTargets: Container[] | null;
    }
    > = {};

    protected _globallyInteractiveContainers: Container[] = [];

    /** The global pointer event. Useful for getting the pointer position without listening to events. */
    public get pointer(): Readonly<InputEvent>
    {
        return this._rootPointerEvent;
    }

    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onPointerOverOut = this._onPointerOverOut.bind(this);

        // @ts-expect-error - We override the EventsTicker update method to dispatch pointermove events directly
        EventsTicker._update = () =>
        {
            if (this._rootPointerEvent.pointerType === 'touch' || this.ignoreDynamicEvents) return;
            globalThis.document.dispatchEvent(
                new PointerEvent('pointermove', {
                    clientX: this._rootPointerEvent.client.x,
                    clientY: this._rootPointerEvent.client.y,
                    pointerType: this._rootPointerEvent.pointerType,
                    pointerId: this._rootPointerEvent.pointerId,
                })
            );
        };
    }

    /**
     * Sets the current cursor mode, handling any callbacks or CSS style changes.
     * @param mode - cursor mode, a key from the cursorStyles dictionary
     */
    public setCursor(mode: string | object): void
    {
        mode = mode || 'default';

        // if the mode didn't actually change, bail early
        if (this._currentCursor === mode)
        {
            return;
        }
        this._currentCursor = mode;

        // offscreen canvas does not support setting styles
        if (globalThis.OffscreenCanvas && this.domElement instanceof OffscreenCanvas)
        {
            return;
        }

        const style = this.cursorStyles[mode as string] || mode;

        // only do things if there is a cursor style for it
        if (style)
        {
            switch (typeof style)
            {
                case 'string':
                    // string styles are handled as cursor CSS
                    this.domElement.style.cursor = style;
                    break;
                case 'object':
                    // if it is an object, assume that it is a dictionary of CSS styles,
                    // apply it to the interactionDOMElement
                    Object.assign(this.domElement.style, style);
                    break;
            }
        }
    }

    /**
     * Runner init called, view is available at this point.
     * @ignore
     */
    public init(_options: null): void
    {
        const { canvas, resolution } = this.renderer;

        this.setTargetElement(canvas);
        this.resolution = resolution;

        if (this.renderer.events)
        {
            warn('InputSystem and EventSystem are mutually exclusive. Disabling EventSystem.');
            this.renderer.events.destroy();
            applyInputEventsCompatibility();
        }
    }

    /**
     * Handle changing resolution.
     * @ignore
     */
    public resolutionChange(resolution: number): void
    {
        this.resolution = resolution;
    }

    /**
     * Sets the {@link EventSystem#domElement domElement} and binds event listeners.
     *
     * To deregister the current DOM element without setting a new one, pass {@code null}.
     * @param element - The new DOM element.
     */
    public setTargetElement(element: HTMLElement): void
    {
        this._removeEvents();
        this.domElement = element;
        this._addEvents();
    }

    /** Destroys all event listeners and detaches the renderer. */
    public destroy(): void
    {
        this.setTargetElement(null);
        this.renderer = null;
        this._currentCursor = null;
    }

    /**
     * Maps x and y coords from a DOM object and maps them correctly to the PixiJS view. The
     * resulting value is stored in the point. This takes into account the fact that the DOM
     * element could be scaled and positioned anywhere on the screen.
     * @param point - the point that the result will be stored in
     * @param x - the x coord of the position to map
     * @param y - the y coord of the position to map
     */
    public mapPositionToPoint(point: PointData, x: number, y: number): void
    {
        const rect = this.domElement.isConnected
            ? this.domElement.getBoundingClientRect()
            : {
                x: 0,
                y: 0,
                width: (this.domElement as any).width,
                height: (this.domElement as any).height,
                left: 0,
                top: 0,
            };

        const resolutionMultiplier = 1.0 / this.resolution;

        point.x = (x - rect.left) * ((this.domElement as any).width / rect.width) * resolutionMultiplier;
        point.y = (y - rect.top) * ((this.domElement as any).height / rect.height) * resolutionMultiplier;
    }

    protected prerender(): void
    {
        this._cachedHitTests = {};
    }

    protected render()
    {
        if (InputSystem.interactionDirty) return;

        InputSystem.interactionDirty = this.renderer.renderGroup.hasRenderableCountChanged;
    }

    public hitTest(x: number, y: number, getAll?: false, ignoreCache?: boolean): Container;
    public hitTest(x: number, y: number, getAll?: true, ignoreCache?: boolean): Container[];
    /**
     * Finds the Container that is the target of a event at the given coordinates.
     *
     * The passed (x,y) coordinates are in the world space.
     * @param x - The x coordinate of the event.
     * @param y - The y coordinate of the event.
     * @param getAll - If true, returns all targets that are hit. If false, returns only the first.
     * @param ignoreCache - If true, ignores the cached hit test.
     */
    public hitTest(x: number, y: number, getAll = false, ignoreCache = false): Container | Container[]
    {
        this._seenCount = 0;
        let firstInteractive: Container = null;

        // if we have a cached hit test for this point, use it
        if (!ignoreCache && this._cachedHitTests[`${x},${y}`] && !InputSystem.interactionDirty)
        {
            return getAll ? this._cachedHitTests[`${x},${y}`] : this._cachedHitTests[`${x},${y}`][0];
        }

        // filter interactive objects to only those in the scene
        if (InputSystem.interactionDirty)
        {
            this._interactiveCount = 0;
            this._globallyInteractiveContainers = [];
            this._cachedHitTests = {};
            for (let i = 0; i < InputSystem._interactiveContainers.length; i++)
            {
                const ic = InputSystem._interactiveContainers[i];

                if (this._inSceneGraph(ic) && isRenderable(ic))
                {
                    if (ic._input._globalMove) this._globallyInteractiveContainers.push(ic);
                    this._interactiveCount++;
                    if (!firstInteractive) firstInteractive = ic;
                }
            }

            InputSystem.interactionDirty = false;
        }

        // no point in hit testing if nothing is interactive
        if (this._interactiveCount === 0)
        {
            return null;
        }

        // if we only have one interactive object, we can hit test it directly
        if (
            this._interactiveCount === 1
            && !prune(firstInteractive, new Point(x, y), this._interactiveCount, 0, hitTestFn)
            && this._inSceneGraph(firstInteractive)
        )
        {
            const hit = hitTestFn(firstInteractive, new Point(x, y)) ? firstInteractive : null;

            this._cachedHitTests[`${x},${y}`] = [hit];

            return hit;
        }

        const res = this._hitTestRecursive(
            this.renderer.lastObjectRendered,
            new Point(x, y),
            this._interactiveCount,
            this._seenCount
        );

        this._cachedHitTests[`${x},${y}`] = res ? res : null;

        // eslint-disable-next-line no-nested-ternary
        return res ? (getAll ? res : res[0]) : null;
    }

    private _hitTestRecursive(
        currentTarget: Container,
        location: Point,
        interactiveCount: number,
        seenCount: number
    ): Container[]
    {
        // attempt to prune the container as early as possible
        if (prune(currentTarget, location, interactiveCount, seenCount, hitTestFn))
        {
            return null;
        }

        const interactiveChildren = currentTarget._input?.interactiveChildren ?? true;

        if (currentTarget.children.length > 0 && interactiveChildren)
        {
            for (let i = currentTarget.children.length - 1; i >= 0; i--)
            {
                const child = currentTarget.children[i];
                const hit = this._hitTestRecursive(child, location, interactiveCount, seenCount);

                if (hit && hit.length > 0)
                {
                    // its a good idea to check if a child has lost its parent.
                    // this means it has been removed whilst looping so its best
                    if (!child.parent)
                    {
                        continue;
                    }

                    // Only add the current hit-test target to the hit-test chain if the chain
                    // has already started (i.e. the event target has been found) or if the current
                    // target is interactive (i.e. it becomes the event target).
                    const isInteractive = currentTarget._input?.enable;

                    if (hit.length > 0 || isInteractive) hit.push(currentTarget);

                    return hit;
                }
            }
        }

        const isInteractive = currentTarget._input?.enable;

        if (isInteractive)
        {
            seenCount++;
        }

        if (isInteractive && hitTestFn(currentTarget, location))
        {
            return [currentTarget];
        }

        return null;
    }

    /** Register event listeners on {@link Renderer#domElement this.domElement}. */
    private _addEvents(): void
    {
        if (this._eventsAdded || !this.domElement)
        {
            return;
        }

        const style = this.domElement.style as CrossCSSStyleDeclaration;

        if (style)
        {
            if ((globalThis.navigator as any).msPointerEnabled)
            {
                style.msContentZooming = 'none';
                style.msTouchAction = 'none';
            }
            else
            {
                style.touchAction = 'none';
            }
        }

        globalThis.document.addEventListener('pointermove', this._onPointerMove, true);
        this.domElement.addEventListener('pointerdown', this._onPointerDown, true);
        // pointerout is fired in addition to pointerup (for touch events) and pointercancel
        // we already handle those, so for the purposes of what we do in onPointerOut, we only
        // care about the pointerleave event
        this.domElement.addEventListener('pointerleave', this._onPointerOverOut, true);
        this.domElement.addEventListener('pointerover', this._onPointerOverOut, true);
        // // globalThis.addEventListener('pointercancel', this.onPointerCancel, true);
        globalThis.addEventListener('pointerup', this._onPointerUp, true);

        // this.domElement.addEventListener('wheel', this.onWheel, {
        //     passive: true,
        //     capture: true,
        // });

        this._eventsAdded = true;
    }

    /** Unregister event listeners on {@link EventSystem#domElement this.domElement}. */
    private _removeEvents(): void
    {
        if (!this._eventsAdded || !this.domElement)
        {
            return;
        }

        const style = this.domElement.style as CrossCSSStyleDeclaration;

        // offscreen canvas does not have style, so check first
        if (style)
        {
            if ((globalThis.navigator as any).msPointerEnabled)
            {
                style.msContentZooming = '';
                style.msTouchAction = '';
            }
            else
            {
                style.touchAction = '';
            }
        }

        globalThis.document.removeEventListener('pointermove', this._onPointerMove, true);
        this.domElement.removeEventListener('pointerdown', this._onPointerDown, true);
        this.domElement.removeEventListener('pointerleave', this._onPointerOverOut, true);
        this.domElement.removeEventListener('pointerover', this._onPointerOverOut, true);
        // globalThis.removeEventListener('pointercancel', this.onPointerCancel, true);
        globalThis.removeEventListener('pointerup', this._onPointerUp, true);

        this.domElement = null;
        this._eventsAdded = false;
    }

    private _createEvent(federatedEvent: InputEvent)
    {
        const newEvent = new InputEvent();

        copyData(federatedEvent, newEvent);

        newEvent.nativeEvent = federatedEvent.nativeEvent;
        newEvent.originalEvent = federatedEvent;
        newEvent.path = this.hitTest(newEvent.global.x, newEvent.global.y, true);
        newEvent.target = newEvent.path ? newEvent.path[0] : null;

        return newEvent;
    }

    private _dispatchEvent(event: InputEvent, type: Parameters<Input['emit']>[0])
    {
        if (!event.path)
        {
            return false;
        }

        // loop through the path an emit the event
        for (let i = 0; i < event.path.length; i++)
        {
            const target = event.path[i];

            if (event.propagationStopped)
            {
                break;
            }

            event.currentTarget = target;
            if (target._input?.enable)
            {
                target._input.emit(type, event);
            }
        }

        return !event.propagationStopped;
    }

    /**
     * Finds the most specific event-target in the given propagation path that is still mounted in the scene graph.
     *
     * This is used to find the correct `pointerup` and `pointerout` target in the case that the original `pointerdown`
     * or `pointerover` target was unmounted from the scene graph.
     * @param propagationPath - The propagation path was valid in the past.
     * @returns - The most specific event-target still mounted at the same location in the scene graph.
     */
    protected _findMountedTarget(propagationPath: Container[]): Container
    {
        if (!propagationPath)
        {
            return null;
        }

        let currentTarget = propagationPath[0];

        for (let i = 1; i < propagationPath.length; i++)
        {
            // Set currentTarget to the next target in the path only if it is still attached to the
            // scene graph (i.e. parent still points to the expected ancestor).
            if (propagationPath[i].parent === currentTarget)
            {
                currentTarget = propagationPath[i];
            }
            else
            {
                break;
            }
        }

        return currentTarget;
    }

    /**
     * Event handler for pointer down events on {@link EventSystem#domElement this.domElement}.
     * @param nativeEvent - The native pointer event.
     */
    private _onPointerDown(nativeEvent: PointerEvent): void
    {
        const federatedEvent = this._bootstrapEvent(this._rootPointerEvent, nativeEvent);
        const newEvent = this._createEvent(federatedEvent);

        this._dispatchEvent(newEvent, 'pointerdown');
        // TODO: may need to bail out if this._dispatchEvent returns false
        this._trackingData(federatedEvent.pointerId).pressTargetsByButton[federatedEvent.button]
            = newEvent.composedPath;
    }

    private _onPointerUp(nativeEvent: PointerEvent): void
    {
        const federatedEvent = this._bootstrapEvent(this._rootPointerEvent, nativeEvent);
        const newEvent = this._createEvent(federatedEvent);

        this._dispatchEvent(newEvent, 'pointerup');
        const trackingData = this._trackingData(federatedEvent.pointerId);
        const pressedTargets = trackingData.pressTargetsByButton[federatedEvent.button];
        const activePressTarget = this._findMountedTarget(pressedTargets);
        const composedPath = newEvent.composedPath;

        // fire the click event if the press target is still in the composed path
        // else fire the upoutside event
        if (activePressTarget && !composedPath.includes(activePressTarget))
        {
            const upoutsideEvent = new InputEvent();

            copyData(newEvent, upoutsideEvent);
            upoutsideEvent.type = 'pointerupoutside';
            // we need to filter out press targets that are in the path
            const index = pressedTargets.indexOf(activePressTarget);
            const path = pressedTargets.slice(0, index + 1).reverse();
            // TODO: is it going to be faster to pass a check list to dispatchEvent, or to filter the path here?
            const filteredPath = path.filter((target) => !composedPath.includes(target));

            upoutsideEvent.path = filteredPath;
            this._dispatchEvent(upoutsideEvent, 'pointerupoutside');
        }

        if (activePressTarget && composedPath.includes(activePressTarget))
        {
            const clickEvent = new InputEvent();

            copyData(newEvent, clickEvent);
            clickEvent.type = 'pointertap';
            clickEvent.target = newEvent.target;
            clickEvent.path = pressedTargets.slice(0, composedPath.indexOf(activePressTarget) + 1).reverse();
            this._dispatchEvent(clickEvent, 'pointertap');
        }
    }

    private _onPointerMove(nativeEvent: PointerEvent): void
    {
        const federatedEvent = this._bootstrapEvent(this._rootPointerEvent, nativeEvent);
        const newEvent = this._createEvent(federatedEvent);

        const trackingData = this._trackingData(federatedEvent.pointerId);
        const outTarget = this._findMountedTarget(trackingData.overTargets);

        if (outTarget && outTarget !== newEvent.target)
        {
            // pointerout always occurs on the overTarget when the pointer hovers over another element.
            const outEvent = new InputEvent();

            copyData(newEvent, outEvent);
            outEvent.type = 'pointerout';
            outEvent.path = [outTarget];
            outEvent.target = outTarget;

            this._dispatchEvent(outEvent, 'pointerout');
        }

        // Then pointerover
        if (outTarget !== newEvent.target && newEvent.path?.length > 0)
        {
            const overEvent = new InputEvent();

            copyData(newEvent, overEvent);
            overEvent.type = 'pointerover';
            overEvent.path = newEvent.path.slice();
            overEvent.target = overEvent.path[0];

            this._dispatchEvent(overEvent, 'pointerover');
        }

        trackingData.overTargets = newEvent.composedPath;

        this._dispatchEvent(newEvent, 'pointermove');
        this._globalPointerMove(newEvent);

        if (newEvent.pointerType === 'mouse')
        {
            this._preferredCursor = newEvent.target?._input?.cursor;
        }

        this.setCursor(this._preferredCursor);
    }

    private _globalPointerMove(moveEvent: InputEvent): void
    {
        const emit = (container: Container) =>
        {
            moveEvent.currentTarget = container;
            if (container._input?.enable)
            {
                container._input.emit('globalpointermove', moveEvent);
            }
        };

        for (let i = 0; i < this._globallyInteractiveContainers.length; i++)
        {
            const c = this._globallyInteractiveContainers[i];

            emit(c);
        }
    }

    private _onPointerOverOut(nativeEvent: PointerEvent)
    {
        const federatedEvent = this._bootstrapEvent(this._rootPointerEvent, nativeEvent);
        const trackingData = this._trackingData(federatedEvent.pointerId);

        if (federatedEvent.type === 'pointerover')
        {
            const newEvent = this._createEvent(federatedEvent);

            this._dispatchEvent(newEvent, 'pointerover');
            trackingData.overTargets = newEvent.composedPath;
            if (newEvent.pointerType === 'mouse') this._preferredCursor = newEvent.target?.cursor;
        }
        else if (trackingData.overTargets && trackingData.overTargets.length > 0)
        {
            const outTarget = this._findMountedTarget(trackingData.overTargets);
            const overEvent = new InputEvent();

            copyData(federatedEvent, overEvent);
            overEvent.type = 'pointerout';
            overEvent.path = [outTarget];
            overEvent.target = outTarget;

            this._dispatchEvent(overEvent, 'pointerout');

            trackingData.overTargets = null;
            if (federatedEvent.pointerType === 'mouse') this._preferredCursor = federatedEvent.target?.cursor;
        }

        this.setCursor(this._preferredCursor);
    }

    private _inSceneGraph(container: Container): boolean
    {
        let current = container;

        while (current)
        {
            if (!current.parentRenderGroup)
            {
                return current.renderGroup === this.renderer.lastObjectRendered.renderGroup;
            }

            if (current.parentRenderGroup === this.renderer.lastObjectRendered.renderGroup)
            {
                return true;
            }
            current = current.parentRenderGroup.root;
        }

        return false;
    }

    private _trackingData(pointerId: number): InputSystem['_trackedData'][0]
    {
        if (!this._trackedData[pointerId])
        {
            this._trackedData[pointerId] = {
                pressTargetsByButton: {},
                clicksByButton: {},
                overTargets: null,
            };
        }

        return this._trackedData[pointerId];
    }

    /**
     * Normalizes the `nativeEvent` into a federateed {@link InputEvent}.
     * @param event -
     * @param nativeEvent -
     */
    private _bootstrapEvent(event: InputEvent, nativeEvent: PointerEvent): InputEvent
    {
        event.originalEvent = null;
        event.nativeEvent = nativeEvent;

        event.pointerId = nativeEvent.pointerId;
        event.width = nativeEvent.width;
        event.height = nativeEvent.height;
        event.isPrimary = nativeEvent.isPrimary;
        event.pointerType = nativeEvent.pointerType;
        event.pressure = nativeEvent.pressure;
        event.tangentialPressure = nativeEvent.tangentialPressure;
        event.tiltX = nativeEvent.tiltX;
        event.tiltY = nativeEvent.tiltY;
        event.twist = nativeEvent.twist;
        event.isTrusted = nativeEvent.isTrusted;
        event.srcElement = nativeEvent.srcElement;
        event.timeStamp = performance.now();
        event.type = nativeEvent.type;

        event.altKey = nativeEvent.altKey;
        event.button = nativeEvent.button;
        event.buttons = nativeEvent.buttons;
        event.client.x = nativeEvent.clientX;
        event.client.y = nativeEvent.clientY;
        event.ctrlKey = nativeEvent.ctrlKey;
        event.metaKey = nativeEvent.metaKey;
        event.movement.x = nativeEvent.movementX;
        event.movement.y = nativeEvent.movementY;
        event.page.x = nativeEvent.pageX;
        event.page.y = nativeEvent.pageY;
        event.relatedTarget = null;
        event.shiftKey = nativeEvent.shiftKey;

        this.mapPositionToPoint(event.screen, nativeEvent.clientX, nativeEvent.clientY);
        event.global.copyFrom(event.screen); // global = screen for top-level
        event.offset.copyFrom(event.screen); // EventBoundary recalculates using its rootTarget

        event.isTrusted = nativeEvent.isTrusted;
        if (event.type === 'pointerleave')
        {
            event.type = 'pointerout';
        }

        return event;
    }

    protected static _interactiveContainers: Container[] = [];
    public static interactionDirty = false;

    public static addInteractive(container: Container): void
    {
        if (this._interactiveContainers.indexOf(container) === -1)
        {
            this._interactiveContainers.push(container);
        }
        this.interactionDirty = true;
    }

    public static removeInteractive(container: Container): void
    {
        const index = this._interactiveContainers.indexOf(container);

        if (index !== -1)
        {
            this._interactiveContainers.splice(index, 1);
        }

        this.interactionDirty = true;
    }
}

interface CrossCSSStyleDeclaration extends CSSStyleDeclaration
{
    msContentZooming: string;
    msTouchAction: string;
}
