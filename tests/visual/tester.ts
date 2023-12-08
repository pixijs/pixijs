import { ensureDirSync, existsSync, readFileSync, writeFile } from 'fs-extra';
import { dirname } from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { autoDetectRenderer } from '../../src/rendering/renderers/autoDetectRenderer';
import { RenderTexture } from '../../src/rendering/renderers/shared/texture/RenderTexture';
import { Container } from '../../src/scene/container/Container';
import { Graphics } from '../../src/scene/graphics/shared/Graphics';

import type { Renderer, RendererOptions } from '../../src/rendering/renderers/types';

function toArrayBuffer(buf: Buffer): ArrayBuffer
{
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);

    for (let i = 0; i < buf.length; ++i)
    {
        view[i] = buf[i];
    }

    return ab;
}

/**
 * This special test function will take a snap shot from scene and compare it to
 * a previously generated correct image. It will then return a number which is the threshold
 * for how accurate the two scenes are. 0 = the same!
 * If there is no previous image, one will be generated and stored for future tests.
 * @param id - a unique id for this scene comparison test. An image will be generated with this id as its name.
 * @param createFunction - a function that takes a scene and adds stuff to it for our snapshot
 * @param rendererType
 * @param options
 */
export async function renderTest(
    id: string,
    createFunction: (scene: Container, renderer: Renderer) => Promise<void>,
    rendererType: 'webgl' | 'webgpu',
    options?: Partial<RendererOptions>,
): Promise<number>
{
    const sceneOpts = {
        width: 128,
        height: 128,
        backgroundColor: 0x1099bb,
        ...options
    };

    const renderer = await autoDetectRenderer({
        preference: rendererType,
        ...sceneOpts,
    });
    const stage = new Container();
    const scene = new Container();

    stage.addChild(new Graphics().rect(0, 0, sceneOpts.width, sceneOpts.height)).fill(renderer.background.color);
    stage.addChild(scene);

    await createFunction(scene, renderer);

    document.body.appendChild(renderer.canvas as HTMLCanvasElement);

    renderer.render({
        container: stage,
    });

    const imageLocation = `./tests/visual/snapshots/${rendererType}-${id}.png`;

    if (!existsSync(imageLocation))
    {
        await saveSnapShot(imageLocation, stage, renderer);
    }

    const prevSnapShot = loadSnapShot(imageLocation);
    const newSnapShot = createSnapShot(stage, renderer);
    const diff = new PNG({ width: sceneOpts.width, height: sceneOpts.height });

    const match: number = pixelmatch(
        prevSnapShot,
        newSnapShot,
        diff.data,
        sceneOpts.width,
        sceneOpts.height,
        { threshold: 0.2 }
    );

    // Write the diff to a file for visual inspection
    ensureDirSync('.pr_uploads/visual');
    await writeFile(`.pr_uploads/visual/${rendererType}-${id}-diff.png`, PNG.sync.write(diff));
    // save output image
    await saveSnapShot(`.pr_uploads/visual/${rendererType}-${id}.png`, stage, renderer);

    renderer.destroy();

    return match;
}

/**
 * returns an array of pixels of the current scene.
 * @param stage - pixi container that contains the scene view
 * @param renderer - the pixi renderer that we will extract the snapshot from
 */
function createSnapShot(stage: Container, renderer: Renderer)
{
    const rt = RenderTexture.create({ width: renderer.width, height: renderer.height });

    renderer.render({
        target: rt,
        container: stage,
    });

    return renderer.extract.pixels(rt).pixels;
}

/**
 * returns an array of pixels of a saved image
 * @param input - the location of the saved image
 */
function loadSnapShot(input: string): Uint8Array
{
    return new Uint8Array(toArrayBuffer(PNG.sync.read(readFileSync(input)).data));
}

/**
 * writes a PNG file of the passed in scene.
 * @param output - the location where to save the image
 * @param stage - pixi container that contains the scene view
 * @param renderer - the pixi renderer that we will extract the snapshot from
 */
async function saveSnapShot(output: string, stage: Container, renderer: Renderer): Promise<void>
{
    ensureDirSync(dirname(output));

    const rt = RenderTexture.create({ width: renderer.width, height: renderer.height });

    renderer.render({
        target: rt,
        container: stage,
    });

    const base64Image = await renderer.extract.base64({
        target: rt,
        format: 'png',
        resolution: 1,
    });

    const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');

    await new Promise<void>((resolve) =>
    {
        writeFile(output, base64Data, 'base64', (e: Error) =>
        {
            if (!e)
            {
                resolve();
            }
            else
            {
                // eslint-disable-next-line no-console
                console.log(e);
                resolve();
            }
        });
    });
}
