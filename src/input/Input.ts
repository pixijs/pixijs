import EventEmitter from 'eventemitter3';
import { InputSystem } from './InputSystem';

import type { Cursor } from '../events/FederatedEventTarget';
import type { Container } from '../scene/container/Container';
import type { InputEvent } from './events/InputEvent';

export interface InputConstructor
{
    input?: InputOptions;
}

export interface InputOptions
{
    target?: any;
    interactive?: boolean;
    interactiveChildren?: boolean;
    globalMove?: boolean;
    cursor?: Cursor | string;
    isPointer?: boolean;
    onpointermove?: (i: InputEvent) => void;
    onglobalpointermove?: (i: InputEvent) => void;
    onpointerover?: (i: InputEvent) => void;
    onpointerout?: (i: InputEvent) => void;
    onpointerup?: (i: InputEvent) => void;
    onpointerupoutside?: (i: InputEvent) => void;
    onpointerdown?: (i: InputEvent) => void;
    onpointertap?: (i: InputEvent) => void;

    globalWheel?: boolean;
    onwheel?: (i: InputEvent) => void;
    onglobalwheel?: (i: InputEvent) => void;
}

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

    wheel: InputEvent;
    globalwheel: InputEvent;
}>
{
    /**
     * Determines if the children to the container can be clicked/touched
     * Setting this to false allows PixiJS to bypass a recursive `hitTest` function
     */
    public interactiveChildren = true;
    /** The cursor preferred when the mouse pointer is hovering over. */
    public cursor: Cursor | string = 'default';
    /** Handler for 'pointermove' event */
    public onpointermove: (i: InputEvent) => void;
    /** Handler for 'globalpointermove' event */
    public onglobalpointermove: (i: InputEvent) => void;
    /** Handler for 'pointerover' event */
    public onpointerover: (i: InputEvent) => void;
    /** Handler for 'pointerout' event */
    public onpointerout: (i: InputEvent) => void;
    /** Handler for 'pointerup' event */
    public onpointerup: (i: InputEvent) => void;
    /** Handler for 'pointerupoutside' event */
    public onpointerupoutside: (i: InputEvent) => void;
    /** Handler for 'pointerdown' event */
    public onpointerdown: (i: InputEvent) => void;
    /** Handler for 'pointertap' event */
    public onpointertap: (i: InputEvent) => void;

    /** Handler for 'wheel' event */
    public onwheel: (i: InputEvent) => void;
    /** Handler for 'globalwheel' event */
    public onglobalwheel: (i: InputEvent) => void;

    public _globalMove = false;
    public _globalWheel = false;
    public _isPointer = false;
    protected container: Container = null;
    protected _interactive = false;

    constructor(options: InputOptions)
    {
        super();
        this.container = options.target;
        this.interactive = options.interactive ?? false;
        this.globalMove = options.globalMove ?? false;
        this.cursor = options.cursor ?? 'default';
        this.isPointer = options.isPointer ?? false;
        this.interactiveChildren = options.interactiveChildren ?? true;

        this.onpointermove ??= options.onpointermove;
        this.onglobalpointermove ??= options.onglobalpointermove;
        this.onpointerover ??= options.onpointerover;
        this.onpointerout ??= options.onpointerout;
        this.onpointerup ??= options.onpointerup;
        this.onpointerupoutside ??= options.onpointerupoutside;
        this.onpointerdown ??= options.onpointerdown;
        this.onpointertap ??= options.onpointertap;

        this.globalWheel = options.globalWheel ?? false;
        this.onwheel ??= options.onwheel;
        this.onglobalwheel ??= options.onglobalwheel;

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

    get globalWheel(): boolean
    {
        return this._globalWheel;
    }

    /**
     * Enable global wheel events for the Container.
     * @default false
     */
    set globalWheel(val)
    {
        if (val === this._globalWheel)
        {
            return;
        }

        this._globalWheel = val;
        if (val) InputSystem.interactionDirty = true;
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
     * Enable or disable input events for the Container.
     * @default false
     */
    get interactive(): boolean
    {
        return this._interactive;
    }

    set interactive(val)
    {
        if (val === this._interactive)
        {
            return;
        }

        this._interactive = val;
        !val ? InputSystem.addInteractive(this.container) : InputSystem.removeInteractive(this.container);
    }

    public destroy()
    {
        this.container.off('destroyed', this.destroy, this);
        this.removeAllListeners();
        this.container = null;
        this.interactive = false;
        this._globalMove = false;
        this._globalWheel = false;
    }
}
