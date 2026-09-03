import { Container } from '../../container/Container';
import { Graphics } from '../../graphics/shared/Graphics';
import { Mesh } from '../../mesh/shared/Mesh';
import { MeshGeometry } from '../../mesh/shared/MeshGeometry';
import { NineSliceSprite } from '../../sprite-nine-slice/NineSliceSprite';
import { Sprite } from '../Sprite';
import { getTexture, getWebGLRenderer } from '@test-utils';
import { RenderTexture } from '~/rendering';

import type { WebGLRenderer } from '~/rendering';

// These tests render to a RenderTexture target so `ViewSystem.prerender` does not override
// `renderer._roundPixels` with a view's value (texture targets resolve to no active view). That lets
// each test drive `renderer._roundPixels` directly and assert that the BATCHED pipes re-bake the
// value on the per-frame add path, rather than only once when the GPU data is first initialised.

function renderTo(renderer: WebGLRenderer, container: Container): void
{
    const target = RenderTexture.create({ width: 32, height: 32 });

    renderer.render({ container, target });

    target.destroy(true);
}

describe('SpritePipe roundPixels re-bake', () =>
{
    it('re-bakes roundPixels when renderer._roundPixels changes between renders of the same sprite', async () =>
    {
        const renderer = await getWebGLRenderer();

        const sprite = new Sprite(getTexture());

        const stageA = new Container();

        stageA.addChild(sprite);

        renderer['_roundPixels'] = 0;
        renderTo(renderer, stageA);

        expect(sprite._gpuData[renderer.uid].roundPixels).toBe(0);

        // move the same renderable to a second stage and render with the renderer flag flipped
        const stageB = new Container();

        stageB.addChild(sprite);

        renderer['_roundPixels'] = 1;
        renderTo(renderer, stageB);

        expect(sprite._gpuData[renderer.uid].roundPixels).toBe(1);

        sprite.destroy();
        renderer.destroy();
    });

    it('ORs in the sprite own roundPixels flag', async () =>
    {
        const renderer = await getWebGLRenderer();

        const sprite = new Sprite(getTexture());

        sprite.roundPixels = true;

        const stage = new Container();

        stage.addChild(sprite);

        renderer['_roundPixels'] = 0;
        renderTo(renderer, stage);

        expect(sprite._gpuData[renderer.uid].roundPixels).toBe(1);

        sprite.destroy();
        renderer.destroy();
    });

    it('keeps a constant baked value across renders in the single-view path', async () =>
    {
        const renderer = await getWebGLRenderer();

        const sprite = new Sprite(getTexture());

        const stage = new Container();

        stage.addChild(sprite);

        renderer['_roundPixels'] = 0;
        renderTo(renderer, stage);
        renderTo(renderer, stage);

        expect(sprite._gpuData[renderer.uid].roundPixels).toBe(0);

        sprite.destroy();
        renderer.destroy();
    });
});

describe('NineSliceSpritePipe roundPixels re-bake', () =>
{
    it('re-bakes roundPixels when renderer._roundPixels changes between renders of the same sprite', async () =>
    {
        const renderer = await getWebGLRenderer();

        const sprite = new NineSliceSprite({ texture: getTexture({ width: 256, height: 256 }) });

        const stageA = new Container();

        stageA.addChild(sprite);

        renderer['_roundPixels'] = 0;
        renderTo(renderer, stageA);

        expect(sprite._gpuData[renderer.uid].roundPixels).toBe(0);

        const stageB = new Container();

        stageB.addChild(sprite);

        renderer['_roundPixels'] = 1;
        renderTo(renderer, stageB);

        expect(sprite._gpuData[renderer.uid].roundPixels).toBe(1);

        sprite.destroy();
        renderer.destroy();
    });

    it('ORs in the sprite own roundPixels flag', async () =>
    {
        const renderer = await getWebGLRenderer();

        const sprite = new NineSliceSprite({ texture: getTexture({ width: 256, height: 256 }) });

        sprite.roundPixels = true;

        const stage = new Container();

        stage.addChild(sprite);

        renderer['_roundPixels'] = 0;
        renderTo(renderer, stage);

        expect(sprite._gpuData[renderer.uid].roundPixels).toBe(1);

        sprite.destroy();
        renderer.destroy();
    });
});

function getBatchedMesh(): Mesh
{
    const size = 10;

    const geometry = new MeshGeometry({
        positions: new Float32Array([-size, -size, size, -size, size, size, -size, size]),
        uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
        indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
    });

    geometry.batchMode = 'batch';

    return new Mesh({ texture: getTexture(), geometry });
}

describe('MeshPipe roundPixels re-bake (batched)', () =>
{
    it('re-bakes roundPixels when renderer._roundPixels changes between renders of the same mesh', async () =>
    {
        const renderer = await getWebGLRenderer();

        const mesh = getBatchedMesh();

        const stageA = new Container();

        stageA.addChild(mesh);

        renderer['_roundPixels'] = 0;
        renderTo(renderer, stageA);

        expect(mesh._gpuData[renderer.uid].batchableMesh.roundPixels).toBe(0);

        const stageB = new Container();

        stageB.addChild(mesh);

        renderer['_roundPixels'] = 1;
        renderTo(renderer, stageB);

        expect(mesh._gpuData[renderer.uid].batchableMesh.roundPixels).toBe(1);

        mesh.destroy();
        renderer.destroy();
    });

    it('ORs in the mesh own roundPixels flag', async () =>
    {
        const renderer = await getWebGLRenderer();

        const mesh = getBatchedMesh();

        mesh.roundPixels = true;

        const stage = new Container();

        stage.addChild(mesh);

        renderer['_roundPixels'] = 0;
        renderTo(renderer, stage);

        expect(mesh._gpuData[renderer.uid].batchableMesh.roundPixels).toBe(1);

        mesh.destroy();
        renderer.destroy();
    });
});

describe('GraphicsPipe roundPixels re-bake (batched)', () =>
{
    it('re-bakes roundPixels when renderer._roundPixels changes between renders of the same graphics', async () =>
    {
        const renderer = await getWebGLRenderer();

        const graphics = new Graphics().rect(0, 0, 10, 10).fill(0xff0000);

        const stageA = new Container();

        stageA.addChild(graphics);

        renderer['_roundPixels'] = 0;
        renderTo(renderer, stageA);

        expect(graphics._gpuData[renderer.uid].batches[0].roundPixels).toBe(0);

        const stageB = new Container();

        stageB.addChild(graphics);

        renderer['_roundPixels'] = 1;
        renderTo(renderer, stageB);

        expect(graphics._gpuData[renderer.uid].batches[0].roundPixels).toBe(1);

        graphics.destroy();
        renderer.destroy();
    });

    it('ORs in the graphics own roundPixels flag', async () =>
    {
        const renderer = await getWebGLRenderer();

        const graphics = new Graphics().rect(0, 0, 10, 10).fill(0xff0000);

        graphics.roundPixels = true;

        const stage = new Container();

        stage.addChild(graphics);

        renderer['_roundPixels'] = 0;
        renderTo(renderer, stage);

        expect(graphics._gpuData[renderer.uid].batches[0].roundPixels).toBe(1);

        graphics.destroy();
        renderer.destroy();
    });
});
