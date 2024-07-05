import EventEmitter from 'eventemitter3';
import { InputSystem } from './InputSystem';

import type { Cursor } from '../events/FederatedEventTarget';
import type { Container } from '../scene/container/Container';

/**
 * Input class for listening to input events on a Container.
 * @example
 * const container = new Container();
 *
 * container.input.enable = true;
 * container.input.on('pointerdown', (event) => {
 *    console.log('pointerdown', event);
 * });
 * @memberof input
 */
export class Input extends EventEmitter<{
    pointermove: InputEvent;
    globalpointermove: InputEvent;
    pointerover: InputEvent;
    pointerout: InputEvent;
    pointerup: InputEvent;
    pointerupoutside: InputEvent;
    pointerdown: InputEvent;
    pointertap: InputEvent;
}>
{
    /**
     * Determines if the children to the container can be clicked/touched
     * Setting this to false allows PixiJS to bypass a recursive `hitTest` function
     */
    public interactiveChildren = true;
    public _globalMove = false;
    /** The cursor preferred when the mouse pointer is hovering over. */
    public cursor: Cursor | string = 'default';
    public _isPointer = false;
    protected container: Container = null;
    protected _enable = false;

    constructor(container: Container)
    {
        super();
        this.container = container;

        this.container.on('destroyed', this.destroy, this);
    }

    get isPointer(): boolean
    {
        return this._isPointer;
    }

    /**
     * A convenience property to set the cursor to 'pointer'
     * @default false
     */
    set isPointer(val)
    {
        this._isPointer = val;
        this.cursor = val ? 'pointer' : 'default';
    }

    get globalMove(): boolean
    {
        return this._globalMove;
    }

    /**
     * Enable global move events for the Container.
     * @default false
     */
    set globalMove(val)
    {
        if (val === this._globalMove)
        {
            return;
        }

        this._globalMove = val;
        if (val) InputSystem.interactionDirty = true;
    }
    /**
     * Enable input events for the Container.
     * @default false
     */
    get enable(): boolean
    {
        return this._enable;
    }

    set enable(val)
    {
        if (val === this._enable)
        {
            return;
        }

        this._enable = val;
        val ? InputSystem.addInteractive(this.container) : InputSystem.removeInteractive(this.container);
    }

    public destroy()
    {
        this.container.off('destroyed', this.destroy, this);
        this.removeAllListeners();
        this.container = null;
        this.enable = false;
        this._globalMove = false;
    }
}
