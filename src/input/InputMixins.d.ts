import type { Input, InputConstructor } from './Input';

declare global
{
    namespace PixiMixins
    {
        interface Container
        {
            input: Input;
            _input: Input;
        }

        interface RendererSystems
        {
            input: import('./InputSystem').InputSystem;
        }

        interface ContainerOptions extends InputConstructor {}
    }
}

export {};
