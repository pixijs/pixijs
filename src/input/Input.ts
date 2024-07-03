import EventEmitter from 'eventemitter3';
import { InputSystem } from './InputSystem';

import type { Container } from '../scene/container/Container';

export class Input extends EventEmitter<{
    pointermove: PointerEvent;
    globalpointermove: PointerEvent;
    pointerover: PointerEvent;
    pointerout: PointerEvent;
    pointerup: PointerEvent;
    pointerupoutside: PointerEvent;
    pointerdown: PointerEvent;
    pointertap: PointerEvent;
}>
{
    public interactiveChildren = true;
    public _globalMove = false;
    public cursor = 'default';
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

    set isPointer(val)
    {
        this._isPointer = val;
        this.cursor = val ? 'pointer' : 'default';
    }

    get globalMove(): boolean
    {
        return this._globalMove;
    }

    set globalMove(val)
    {
        if (val === this._globalMove)
        {
            return;
        }

        this._globalMove = val;
        if (val) InputSystem.interactionDirty = true;
    }

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
