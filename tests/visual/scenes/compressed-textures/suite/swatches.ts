import '~/compressed-textures/dds/init';
import '~/compressed-textures/ktx/init';
import { createTextureFile, fullChain, textureFormats } from './textureFiles';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TextureFile } from './textureFiles';
import type { Renderer, Texture } from '~/rendering';
import type { Container } from '~/scene';

/** A rectangle in screen pixels */
interface Rect
{
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Where a swatch draws its texture: the top level, then one bar per mip level it can select exactly */
export interface Swatch
{
    /** the top level, drawn at a whole-number scale */
    top: Rect;
    /** the bars, each as tall as its level so it samples that level alone, with its level */
    bars: { level: number, rect: Rect }[];
    /** the right and bottom edges of everything the swatch draws */
    right: number;
    bottom: number;
}

/**
 * Lays out a swatch: the image at `scale`, and to its right a stack of bars `barWidth` wide.
 *
 * A bar `height / 2^level` pixels tall makes the GPU sample exactly that mip level, as long as it is at least
 * `width / 2^level` wide. A one pixel bar samples the last level whenever it minifies by at least that much.
 * Bars one or two pixels tall repeat, so every level covers at least three rows.
 * @param file - the texture file
 * @param x - left edge
 * @param y - top edge
 * @param scale - scale of the top level
 * @param barWidth - width of the bars; 0 draws none
 */
export function layoutSwatch(file: TextureFile, x: number, y: number, scale = 1, barWidth = 0): Swatch
{
    const top = { x, y, width: file.width * scale, height: file.height * scale };
    const bars: Swatch['bars'] = [];
    const levels = barWidth ? file.levels ?? fullChain(file.width, file.height) : 1;
    let barY = y;

    for (let level = 1; level < levels; level++)
    {
        const exact = file.height / (2 ** level);
        const selects = Number.isInteger(exact) && exact >= 1 && file.width / (2 ** level) <= barWidth;
        const clamps = level === levels - 1 && file.height >= 2 ** level && file.width / barWidth <= file.height;
        const height = selects ? exact : 1;

        if (!selects && !clamps) continue;

        for (let copy = 0; copy < Math.ceil(3 / height); copy++)
        {
            bars.push({ level, rect: { x: x + top.width + 2, y: barY, width: barWidth, height } });
            barY += height;
        }

        barY += 1;
    }

    return {
        top,
        bars,
        right: x + top.width + (bars.length ? 2 + barWidth : 0),
        bottom: Math.max(y + top.height, barY - 1),
    };
}

/**
 * Loads a generated file through the KTX or DDS loader
 * @param file - the texture file
 * @param data - asset data, such as `{ resolution: 2 }`
 */
export async function loadTextureFile(file: TextureFile, data?: Record<string, unknown>): Promise<Texture>
{
    const container = file.container ?? (textureFormats[file.format].ktx ? 'ktx' : 'dds');
    const src = URL.createObjectURL(new Blob([createTextureFile(file)]));
    const texture = await Assets.load<Texture>({ src, parser: container === 'ktx' ? 'ktx' : 'dds', data });

    URL.revokeObjectURL(src);

    return texture;
}

/**
 * Adds a sprite of the texture covering `rect`
 * @param scene - the container to add to
 * @param texture - the texture
 * @param rect - where to draw it
 */
function addSprite(scene: Container, texture: Texture, rect: Rect): Sprite
{
    const sprite = new Sprite(texture);

    sprite.position.set(rect.x, rect.y);
    sprite.width = rect.width;
    sprite.height = rect.height;
    scene.addChild(sprite);

    return sprite;
}

/**
 * Draws a texture as laid out by {@link layoutSwatch}
 * @param scene - the container to add to
 * @param texture - the loaded texture
 * @param swatch - the layout
 */
export function drawSwatch(scene: Container, texture: Texture, swatch: Swatch): void
{
    addSprite(scene, texture, swatch.top);
    swatch.bars.forEach(({ rect }) => addSprite(scene, texture, rect));
}

/** A texture file and where to draw it */
export interface PlacedSwatch
{
    file: TextureFile;
    swatch: Swatch;
}

/**
 * Loads every file and draws it as a swatch
 * @param scene - the container to add to
 * @param swatches - the files and their layouts
 */
export async function drawSwatches(scene: Container, swatches: PlacedSwatch[]): Promise<void>
{
    const textures = await Promise.all(swatches.map(({ file }) => loadTextureFile(file)));

    swatches.forEach(({ swatch }, i) => drawSwatch(scene, textures[i], swatch));
}

/**
 * Renders once so every texture is uploaded, then loses the WebGL context and waits for it to come back
 * @param scene - the scene to render
 * @param renderer - the renderer
 */
export async function loseAndRestoreContext(scene: Container, renderer: Renderer): Promise<void>
{
    if (!('context' in renderer)) return;

    renderer.render(scene);

    const restored = new Promise<void>((resolve) =>
        renderer.canvas.addEventListener('webglcontextrestored', () => setTimeout(resolve), { once: true }));

    renderer.context.forceContextLoss();
    await restored;
}
