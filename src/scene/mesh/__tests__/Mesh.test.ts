import { Container } from '../../container/Container';
import { Mesh } from '../shared/Mesh';
import { MeshGeometry } from '../shared/MeshGeometry';
import '../init';
import { getTexture, getWebGLRenderer, getWebGPURenderer, itLocalOnly } from '@test-utils';
import { RenderTexture } from '~/rendering';

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

        mesh.destroy();

        expect(mesh.geometry).toBeNull();
        expect(mesh.texture).toBeNull();

        expect(mesh._gpuData).toBeEmptyObject();
    });

    it('should clean up correctly when not batching', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container();

        const mesh = getMesh(false);

        container.addChild(mesh);

        renderer.render({ container });

        const gpuMesh = mesh._gpuData[renderer.uid].batchableMesh;

        expect(gpuMesh).toBeUndefined();

        mesh.destroy();

        expect(mesh.geometry).toBeNull();
        expect(mesh.texture).toBeNull();

        expect(mesh._gpuData).toBeEmptyObject();
    });

    itLocalOnly('should render a non-batched mesh with a WebGPU renderer after another one was destroyed', async () =>
    {
        const rendererA = await getWebGPURenderer();
        const rendererB = await getWebGPURenderer();

        rendererA.destroy();

        const mesh = getMesh(false);

        expect(() => rendererB.render(mesh)).not.toThrow();

        rendererB.destroy();
    });

    it.each([true, false])('should move the mesh after rebuilding with batch mode changed from %s', async (batched) =>
    {
        const renderer = await getWebGLRenderer();
        const target = RenderTexture.create({ width: 40, height: 20 });
        const stage = new Container();
        const parent = stage.addChild(new Container());
        const mesh = parent.addChild(getMesh(batched));

        parent.position.set(10, 10);
        renderer.render({ container: stage, target });

        parent.addChild(new Container());
        mesh.geometry.batchMode = batched ? 'no-batch' : 'batch';
        renderer.render({ container: stage, target });

        parent.x = 30;
        renderer.render({ container: stage, target });

        const { pixels, width } = renderer.extract.pixels(target);

        expect(pixels[((10 * width) + 10) * 4]).toBe(0);
        expect(pixels[((10 * width) + 30) * 4]).toBe(255);

        stage.destroy({ children: true });
        target.destroy(true);
        renderer.destroy();
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
