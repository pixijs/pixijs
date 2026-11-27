import { Container } from '../../container/Container';
import { Graphics } from '../../graphics/shared/Graphics';
import { Mesh } from '../shared/Mesh';
import { MeshGeometry } from '../shared/MeshGeometry';
import '../init';
import '../../graphics/init';
import { getTexture } from '@test-utils';
import { CanvasRenderer } from '~/rendering';

async function setupScene()
{
    // the canvas renderer has no mesh pipe, so the mesh is skipped while the graphics is drawn
    const renderer = new CanvasRenderer();

    await renderer.init({ width: 4, height: 4, backgroundAlpha: 0 });

    const texture = getTexture();
    const geometry = new MeshGeometry({
        positions: new Float32Array([0, 0, 4, 0, 4, 4, 0, 4]),
        uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
        indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
    });
    const mesh = new Mesh({ texture, geometry });
    const graphics = new Graphics().rect(0, 0, 2, 2).fill(0xff0000);
    const container = new Container();

    container.addChild(mesh, graphics);

    renderer.render({ container });

    const destroy = () =>
    {
        renderer.destroy();
        container.destroy({ children: true });
        geometry.destroy();
        texture.destroy(true);
    };

    return { renderer, mesh, graphics, container, destroy };
}

function getPixel(renderer: CanvasRenderer, x: number, y: number): number[]
{
    const context = renderer.canvas.getContext('2d') as CanvasRenderingContext2D;

    return Array.from(context.getImageData(x, y, 1, 1).data);
}

describe('Mesh Canvas rendering', () =>
{
    it('should keep rendering the scene after a skipped mesh is moved', async () =>
    {
        const { renderer, mesh, graphics, container, destroy } = await setupScene();

        try
        {
            mesh.x = 1;
            graphics.x = 2;

            expect(() => renderer.render({ container })).not.toThrow();
            expect(getPixel(renderer, 0, 0)).toEqual([0, 0, 0, 0]);
            expect(getPixel(renderer, 1, 3)).toEqual([0, 0, 0, 0]);
            expect(getPixel(renderer, 3, 1)).toEqual([255, 0, 0, 255]);
        }
        finally
        {
            destroy();
        }
    });

    it('should keep rendering the scene after a skipped mesh changes its texture', async () =>
    {
        const { renderer, mesh, graphics, container, destroy } = await setupScene();
        const texture = getTexture();

        try
        {
            mesh.texture = texture;
            graphics.x = 2;

            expect(() => renderer.render({ container })).not.toThrow();
            expect(mesh.didViewUpdate).toBe(false);
            expect(getPixel(renderer, 0, 0)).toEqual([0, 0, 0, 0]);
            expect(getPixel(renderer, 3, 1)).toEqual([255, 0, 0, 255]);
        }
        finally
        {
            destroy();
            texture.destroy(true);
        }
    });
});
