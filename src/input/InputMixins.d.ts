import type { Input } from './Input';
/* eslint-disable max-len */
declare global
{
    namespace PixiMixins
    {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Container
        {
            input: Input;
            _input: Input;
        }

        interface RendererSystems
        {
            input: import('./InputSystem').InputSystem;
        }
    }
}

export {};
