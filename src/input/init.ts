import { extensions } from '../extensions/Extensions';
import { Container } from '../scene/container/Container';
import { Input } from './Input';
import { InputSystem } from './InputSystem';

import type { InputOptions } from './Input';

const mixin: Partial<Container> = {
    _input: null,
    get input(): Input
    {
        if (!this._input)
        {
            this._input = new Input({ target: this as Container });
        }

        return this._input;
    },
    set input(value: Record<string, InputOptions> | Input)
    {
        if (this._input)
        {
            this._input.destroy();
        }

        if (value instanceof Input)
        {
            this._input = value;

            return;
        }

        this._input = new Input({ target: this as Container, ...value });
    },
    get interactive()
    {
        return this.input.interactive;
    },
    set interactive(val: boolean)
    {
        this.input.interactive = val;
    },
    get interactiveChildren()
    {
        return this.input.interactiveChildren;
    },
    set interactiveChildren(val: boolean)
    {
        this.input.interactiveChildren = val;
    },
};

Container.mixin(mixin);

extensions.add(InputSystem);
