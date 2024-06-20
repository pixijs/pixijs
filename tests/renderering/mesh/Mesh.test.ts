import { Container } from '../../../src/scene/container/Container';
import { Mesh } from '../../../src/scene/mesh/shared/Mesh';
import { MeshGeometry } from '../../../src/scene/mesh/shared/MeshGeometry';
import { getWebGLRenderer } from '../../utils/getRenderer';
import { getTexture } from '../../utils/getTexture';
import '../../../src/scene/mesh/init';

function getMesh(batched = true)
{
    const size = 10;

    const quadGeometry = new MeshGeometry({
        positions: new Float32Array([-size, -size, size, -size, size, size, -size, size]),
        uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
        indices: new Uint32Array([0, 1, 2, 0, 2, 3]), // triangle 1);
    });

    quadGeometry.batchMode = batched ? 'batch' : 'no-batch';

    const mesh = new Mesh({
        texture: getTexture(),
        geometry: quadGeometry
    });

    return mesh;
}

describe('Mesh', () =>
{
    it('should not throw when destroyed', () =>
    {
        const mesh = getMesh();

        expect(() => mesh.destroy()).not.toThrow();
    });

    it('should clean up correctly on the pipe when destroyed', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container();

        const mesh = getMesh();

        container.addChild(mesh);

        renderer.render({ container });

        const gpuMesh = renderer.renderPipes.mesh['_gpuBatchableMeshHash'][mesh.uid];

        mesh.destroy();

        expect(mesh.geometry).toBeNull();
        expect(mesh.texture).toBeNull();

        expect(renderer.renderPipes.mesh['_meshDataHash'][mesh.uid]).toBeNull();
        expect(renderer.renderPipes.mesh['_gpuBatchableMeshHash'][mesh.uid]).toBeNull();

        expect(gpuMesh.mesh).toBeNull();
    });

    it('should clean up correctly when not batching', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container();

        const mesh = getMesh(false);

        container.addChild(mesh);

        renderer.render({ container });

        const gpuMesh = renderer.renderPipes.mesh['_gpuBatchableMeshHash'][mesh.uid];

        expect(gpuMesh).toBeUndefined();

        mesh.destroy();

        expect(mesh.geometry).toBeNull();
        expect(mesh.texture).toBeNull();

        expect(renderer.renderPipes.mesh['_meshDataHash'][mesh.uid]).toBeNull();
        expect(renderer.renderPipes.mesh['_gpuBatchableMeshHash'][mesh.uid]).toBeUndefined();
    });

    it('should support color tinting', () =>
    {
        const mesh = getMesh();

        mesh.tint = 'red';

        expect(mesh.tint).toBe(0xff0000);

        mesh.destroy();
    });

    it('should have correct blendMode based on textures alpha status when not batching', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container();

        const mesh = getMesh();

        mesh.geometry.batchMode = 'no-batch';
        mesh.texture.source.alphaMode = 'no-premultiply-alpha';

        container.addChild(mesh);

        // will assign the state...
        renderer.render({ container });

        expect(mesh.state.blendMode).toBe('normal-npm');

        mesh.destroy();
    });
});
