export * from './settings';
export * from './utils/isMobile';

export interface IAdapter
{
    createCanvas: (width?: number, height?: number) => HTMLCanvasElement;
    getContext2D?(options?: CanvasRenderingContext2DSettings, canvas?: HTMLCanvasElement): CanvasRenderingContext2D;
    getContextWebgl?(options?: WebGLContextAttributes, canvas?: HTMLCanvasElement): WebGLRenderingContext;
    getContextWebglExperimental?(options?: WebGLContextAttributes, canvas?: HTMLCanvasElement): WebGLRenderingContext;
    getContextWebgl2?(options?: WebGLContextAttributes, canvas?: HTMLCanvasElement): WebGL2RenderingContext;
    getWebGLRenderingContext?: () => typeof WebGLRenderingContext;
}
