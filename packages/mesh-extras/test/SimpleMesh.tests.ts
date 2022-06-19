import { SimpleMesh } from '@pixi/mesh-extras';
import { skipHello } from '@pixi/utils';
import { Renderer, BatchRenderer, extensions } from '@pixi/core';
import { expect } from 'chai';

skipHello();

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
        extensions.add(BatchRenderer);

        const renderer = new Renderer();
        const mesh = new SimpleMesh();

        renderer.render(mesh);

        mesh.destroy();
        renderer.destroy();

        extensions.remove(BatchRenderer);
    });
});
