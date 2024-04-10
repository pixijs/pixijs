declare global
{
    namespace PixiMixins
    {
        interface RendererPipes
        {
            mesh: import('./shared/MeshPipe').MeshPipe;
        }
    }
}
export {};
