import { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

type RenderOptions = {
    width: number;
    height: number;
};

export async function getRenderer(options: Partial<RenderOptions> = {}): Promise<WebGLRenderer>
{
    const renderer = new WebGLRenderer();

    await renderer.init({
        width: options.width === undefined ? 100 : options.width,
        height: options.height === undefined ? 100 : options.height,
    });

    return renderer;
}
