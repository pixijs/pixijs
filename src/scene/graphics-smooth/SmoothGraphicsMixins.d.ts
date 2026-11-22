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

        interface WebGLPipes
        {
            smoothGraphics: import('./shared/SmoothGraphicsPipe').SmoothGraphicsPipe;
        }

        interface WebGPUPipes
        {
            smoothGraphics: import('./shared/SmoothGraphicsPipe').SmoothGraphicsPipe;
        }

        interface CanvasPipes
        {
            smoothGraphics: import('./canvas/CanvasSmoothGraphicsPipe').CanvasSmoothGraphicsPipe;
        }
    }
}

export {};
