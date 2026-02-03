import { ensureDirSync, existsSync, readFileSync, writeFile } from 'fs-extra';
import { dirname } from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { Rectangle } from '~/maths';
import { autoDetectRenderer } from '~/rendering';
import { Container, Graphics } from '~/scene';

import type { RenderType } from './types';
import type { Renderer, RendererOptions } from '~/rendering';

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

const cachedPromise: Record<string, Promise<Renderer>> = {};

const rendererOptions = {
    width: 128,
    height: 128,
    backgroundColor: 0x1099bb,
};

const renderTypeSettings: Record<RenderType, Partial<RendererOptions>> = {
    webgpu: {
        preference: 'webgpu',
    } as Partial<RendererOptions>,
    webgl2: {
        preference: 'webgl',
        preferWebGLVersion: 2,
    } as Partial<RendererOptions>,
    webgl1: {
        preference: 'webgl',
        preferWebGLVersion: 1,
    } as Partial<RendererOptions>,
};

/**
 * returns an instance of a renderer to test with. If no options are passed, we always return the same renderer
 * instance for each type. If options are passed, we create a new renderer instance for each call.
 * @param type - the type of renderer to create
 * @param options - any custom options to pass to the renderer
 */
async function getRenderer(type: RenderType, options?: Partial<RendererOptions>): Promise<Renderer>
{
    if (!options)
    {
        cachedPromise[type] ??= autoDetectRenderer({
            ...rendererOptions,
            ...renderTypeSettings[type],
        });

        return cachedPromise[type];
    }

    return autoDetectRenderer({
        ...rendererOptions,
        ...options,
        ...renderTypeSettings[type],
    });
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
 * @param pixelMatch
 */
export async function renderTest(
    id: string,
    createFunction: (scene: Container, renderer: Renderer) => Promise<void>,
    rendererType: RenderType,
    options?: Partial<RendererOptions>,
    pixelMatch = 100,
): Promise<number>
{
    const renderer = await getRenderer(rendererType, options);

    const stage = new Container();
    const scene = new Container();

    const { width, height } = { ...rendererOptions, ...options };

    stage.addChild(new Graphics().rect(0, 0, width, height)).fill(renderer.background.color);
    stage.addChild(scene);

    await createFunction(scene, renderer);

    const testId = `${id}-${rendererType}`;

    const canvas = renderer.extract.canvas({
        target: stage,
        frame: new Rectangle(0, 0, width, height)
    }) as HTMLCanvasElement;

    canvas.id = testId;

    const imageLocation = `./tests/visual/snapshots/${testId}.png`;

    if (!existsSync(imageLocation))
    {
        await saveSnapShot(imageLocation, canvas);
    }

    const { data: prevSnapShot, width: imgWidth, height: imgHeight } = loadSnapShot(imageLocation);
    const newSnapShot = createSnapShot(canvas);
    const diff = new PNG({ width: imgWidth, height: imgHeight });

    if (process.env.DEBUG_MODE)
    {
        document.body.appendChild(canvas);
    }

    const match: number = pixelmatch(
        prevSnapShot,
        newSnapShot,
        diff.data,
        imgWidth,
        imgHeight,
        { threshold: 0.2 }
    );

    if (match > pixelMatch)
    {
        // Write the diff to a file for visual inspection
        ensureDirSync('.pr_uploads/visual');

        await writeFile(`.pr_uploads/visual/${id}-${rendererType}-diff.png`, PNG.sync.write(diff));
        // save output image
        await saveSnapShot(`.pr_uploads/visual/${id}-${rendererType}.png`, canvas);
    }

    // this means we created a custom renderer.. so lts clean up after ourselves!
    if (options)
    {
        renderer.destroy();
    }

    return match;
}

/**
 * returns an array of pixels of the current scene.
 * @param canvas - then canvas to create the snapshot from
 */
function createSnapShot(canvas: HTMLCanvasElement)
{
    // write to a  new canvas to be same!
    const readableCanvas = document.createElement('canvas');

    readableCanvas.width = canvas.width;
    readableCanvas.height = canvas.height;

    const context = readableCanvas.getContext('2d');

    context.drawImage(canvas, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    return new Uint8ClampedArray(imageData.data.buffer);
}

/**
 * returns an array of pixels of a saved image
 * @param input - the location of the saved image
 */
function loadSnapShot(input: string): { data: Uint8Array, width: number, height: number }
{
    const pngData = PNG.sync.read(readFileSync(input));

    return {
        data: new Uint8Array(toArrayBuffer(pngData.data)),
        width: pngData.width,
        height: pngData.height,
    };
}

/**
 * writes a PNG file of the passed in scene.
 * @param output - the location where to save the image
 * @param canvas - the canvas to save
 */
async function saveSnapShot(output: string, canvas: HTMLCanvasElement): Promise<void>
{
    ensureDirSync(dirname(output));

    const base64Image = await canvas.toDataURL('png', 1);

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
