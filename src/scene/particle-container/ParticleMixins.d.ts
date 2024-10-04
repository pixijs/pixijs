declare global
{
    namespace PixiMixins
    {
        interface RendererPipes
        {
            particle: import('./shared/ParticleContainerPipe').ParticleContainerPipe;
        }
    }
}
export {};
