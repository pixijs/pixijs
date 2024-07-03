import { extensions } from '../extensions/Extensions';
import { Container } from '../scene/container/Container';
import { Input } from './Input';
import { InputSystem } from './InputSystem';

const mixin: Partial<Container> = {
    _input: null,
    get input()
    {
        if (!this._input)
        {
            this._input = new Input(this as Container);
        }

        return this._input;
    },
};

Container.mixin(mixin);

extensions.add(InputSystem);
