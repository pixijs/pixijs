import { settings, IAdapter } from '@pixi/settings';

const _getContext = (val: string, options?: WebGLContextAttributes, canvas?: HTMLCanvasElement) =>
{
    canvas = canvas ?? document.createElement('canvas');

    return canvas.getContext(val, options);
};

export const BrowserAdapter = {
    createCanvas: (width: number, height: number): HTMLCanvasElement =>
    {
        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        return canvas;
    },
    getContext2D: (options?: CanvasRenderingContext2DSettings, canvas?: HTMLCanvasElement): CanvasRenderingContext2D =>
        _getContext('2d', options, canvas) as CanvasRenderingContext2D,
    getContextWebgl: (options?: WebGLContextAttributes, canvas?: HTMLCanvasElement): WebGLRenderingContext =>
        _getContext('webgl', options, canvas) as WebGLRenderingContext,
    getContextWebglExperimental: (options?: WebGLContextAttributes, canvas?: HTMLCanvasElement): WebGLRenderingContext =>
        _getContext('experimental-webgl', options, canvas) as WebGLRenderingContext,
    getContextWebgl2: (options?: WebGLContextAttributes, canvas?: HTMLCanvasElement): WebGL2RenderingContext =>
        _getContext('webgl2', options, canvas) as WebGL2RenderingContext,
    getWebGLRenderingContext: () => WebGLRenderingContext
} as IAdapter;

settings.ADAPTER = BrowserAdapter;

export { settings };
