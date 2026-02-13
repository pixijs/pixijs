import { Assets, autoDetectRenderer, Container, Graphics, Rectangle, TexturePool } from 'pixi.js';

import type { Renderer, RendererOptions } from 'pixi.js';
import type { TestScene } from '../../../tests/visual/types';
import type { RenderType } from '../types';

const defaultRendererOptions = {
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
    canvas: {
        preference: 'canvas',
    } as Partial<RendererOptions>,
};

export interface RunResult
{
    canvas: HTMLCanvasElement;
    renderer: Renderer;
}

export async function runScene(
    scene: TestScene,
    rendererType: RenderType,
): Promise<RunResult>
{
    TexturePool.clear();
    Assets.reset();
    await Assets.init({ basePath: '/test-assets/' });

    const options = scene.options ?? {};
    const { width, height } = { ...defaultRendererOptions, ...options };

    const renderer = await autoDetectRenderer({
        ...defaultRendererOptions,
        ...options,
        ...renderTypeSettings[rendererType],
    });

    const stage = new Container();
    const sceneContainer = new Container();

    stage.addChild(new Graphics().rect(0, 0, width, height)).fill(renderer.background.color);
    stage.addChild(sceneContainer);

    await scene.create(sceneContainer, renderer);

    const canvas = renderer.extract.canvas({
        target: stage,
        frame: new Rectangle(0, 0, width, height),
    }) as HTMLCanvasElement;

    return { canvas, renderer };
}

export function getEnabledRenderers(scene: TestScene): Record<RenderType, boolean>
{
    const defaults: Record<RenderType, boolean> = {
        webgpu: true,
        webgl1: true,
        webgl2: true,
        canvas: true,
    };

    const fromRenderers = Array.isArray(scene.renderers)
        ? scene.renderers.reduce((acc, r) =>
        {
            acc[r] = true;

            return acc;
        }, { webgpu: false, webgl1: false, webgl2: false, canvas: false } as Record<RenderType, boolean>)
        : scene.renderers;

    const fromExclude = scene.excludeRenderers?.reduce((acc, r) =>
    {
        acc[r] = false;

        return acc;
    }, {} as Record<RenderType, boolean>) ?? {};

    return { ...defaults, ...fromRenderers, ...fromExclude };
}
