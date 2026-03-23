declare global
{
    namespace PixiMixins
    {
        interface WebGLSystems
        {
            smoothGraphicsContext: import('./shared/SmoothGraphicsContextSystem').SmoothGraphicsContextSystem;
        }
        interface WebGPUSystems
        {
            smoothGraphicsContext: import('./shared/SmoothGraphicsContextSystem').SmoothGraphicsContextSystem;
        }
        // Declared so `Renderer` union (WebGL | WebGPU | Canvas) resolves the property.
        // Smooth graphics is WebGL/WebGPU only; canvas will never populate this.
        interface CanvasSystems
        {
            smoothGraphicsContext: never;
        }
        interface WebGLPipes
        {
            smoothGraphics: import('./shared/SmoothGraphicsPipe').SmoothGraphicsPipe;
        }
        interface WebGPUPipes
        {
            smoothGraphics: import('./shared/SmoothGraphicsPipe').SmoothGraphicsPipe;
        }
    }
}
export {};
