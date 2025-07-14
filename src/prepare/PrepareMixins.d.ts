declare global
{
    namespace PixiMixins
    {
        interface RendererSystems
        {
            /**
             * The prepare mixin provides methods to prepare display objects for rendering.
             * It is used to ensure that textures and other resources are ready before rendering.
             * @category rendering
             * @advanced
             */
            prepare: import('./PrepareBase').PrepareBase;
        }
    }
}

export {};
