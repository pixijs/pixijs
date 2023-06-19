import { Renderer } from '@pixi/core';
import { SimpleMesh } from '@pixi/mesh-extras';

describe('SimpleMesh', () =>
{
    it('should create a simple mesh with defaults', () =>
    {
        const mesh = new SimpleMesh();

        expect(mesh).toBeInstanceOf(SimpleMesh);
        expect(mesh.autoUpdate).toBe(true);

        mesh.destroy();
    });

    it('should render the rope', () =>
    {
        const renderer = new Renderer();
        const mesh = new SimpleMesh();

        renderer.render(mesh);

        mesh.destroy();
        renderer.destroy();
    });
});
