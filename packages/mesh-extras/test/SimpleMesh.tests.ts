import { SimpleMesh } from '@pixi/mesh-extras';
import { skipHello } from '@pixi/utils';
import { Renderer, BatchRenderer } from '@pixi/core';
import { expect } from 'chai';

skipHello();

describe('SimpleMesh', () =>
{
    it('should create a simple mesh with defaults', () =>
    {
        const mesh = new SimpleMesh();

        expect(mesh).to.be.instanceOf(SimpleMesh);
        expect(mesh.autoUpdate).to.be.true;

        mesh.destroy();
    });

    it('should render the rope', () =>
    {
        Renderer.registerPlugin('batch', BatchRenderer);

        const renderer = new Renderer();
        const mesh = new SimpleMesh();

        renderer.render(mesh);

        mesh.destroy();
        renderer.destroy();
    });
});
