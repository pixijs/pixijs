import { ensureDirSync, existsSync, readFileSync, writeFile } from 'fs-extra';
import { dirname } from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { Container } from '@pixi/display';
import { Renderer, IRendererOptions, RenderTexture } from '@pixi/core';
import type { Extract } from '@pixi/extract';
import { Graphics } from '@pixi/graphics';

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
 * @param options
 */
export async function renderTest(
    id: string,
    createFunction: (scene: Container) => Promise<void>,
    options?: IRendererOptions,
): Promise<number>
{
    const sceneOpts = {
        width: 512,
        height: 512,
        backgroundColor: 0xFFFFFF,
        ...options
    };

    const renderer = new Renderer(sceneOpts);
    const stage = new Container();
    const scene = new Container();

    stage.addChild(new Graphics().beginFill(renderer.backgroundColor).drawRect(0, 0, sceneOpts.width, sceneOpts.height));
    stage.addChild(scene);

    await createFunction(scene);

    document.body.appendChild(renderer.view);

    renderer.render(stage);

    const imageLocation = `./test/snapshots/${id}.png`;

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
    ensureDirSync('.artifacts');
    await writeFile(`.artifacts/${id}-diff.png`, PNG.sync.write(diff));

    return match;
}

/**
 * returns an array of pixels of the current scene.
 * @param stage - pixi container that contains the scene view
 * @param renderer - the pixi renderer that we will extract the snapshot from
 */
function createSnapShot(stage: Container, renderer: Renderer): Uint8Array
{
    const rt =  RenderTexture.create({ width: renderer.width, height: renderer.height });

    rt.baseTexture.framebuffer.addDepthTexture();
    renderer.render(stage, { renderTexture: rt });

    return (renderer.plugins.extract as Extract).pixels(rt);
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

    const rt =  RenderTexture.create({ width: renderer.width, height: renderer.height });

    rt.baseTexture.framebuffer.addDepthTexture();

    renderer.render(stage, { renderTexture: rt });

    const base64Image = (renderer.plugins.extract as Extract).base64(rt, 'image/png');
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

export interface TestScene
{
    it: string;
    create: (scene: Container) => Promise<void>;
    id?: string;
    options?: IRendererOptions;
    pixelMatch?: number;
    skip?: boolean;
}
