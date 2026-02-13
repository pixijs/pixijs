import type { TestScene } from '../../tests/visual/types';
import type { RenderType } from './types';

const playgroundGlobs = import.meta.glob('./*.playground.ts');
const visualTestGlobs = import.meta.glob('../../tests/visual/scenes/**/*.scene.ts');
const exampleGlobs = import.meta.glob([
    '../../examples/*.ts',
    '../../examples/*/index.ts',
]);

function basename(path: string): string
{
    return path.split('/').pop() ?? path;
}

function deriveId(filename: string): string
{
    return filename.toLowerCase().replaceAll('.', '-');
}

const playgroundById: Map<string, () => Promise<unknown>> = new Map();

for (const [path, loader] of Object.entries(playgroundGlobs))
{
    const name = basename(path).replace('.playground.ts', '');

    playgroundById.set(name, loader as () => Promise<unknown>);
}

const visualTestById: Map<string, () => Promise<unknown>> = new Map();

for (const [path, loader] of Object.entries(visualTestGlobs))
{
    const id = deriveId(basename(path));

    visualTestById.set(id, loader as () => Promise<unknown>);
}

const exampleById: Map<string, () => Promise<unknown>> = new Map();

for (const [path, loader] of Object.entries(exampleGlobs))
{
    const filename = basename(path);
    const id = filename === 'index.ts'
        ? path.split('/').at(-2)!
        : filename.replace('.ts', '');

    exampleById.set(id, loader as () => Promise<unknown>);
}

const params = new URLSearchParams(location.search);
const type = params.get('type');
const id = params.get('id');
const rendererType = (params.get('renderer') ?? 'webgl2') as RenderType;

try
{
    if (type === 'playground' && id)
    {
        const loader = playgroundById.get(id);

        if (loader)
        {
            const mod = await loader() as { default?: () => Promise<void> };

            if (typeof mod.default === 'function') await mod.default();
        }
    }
    else if (type === 'example' && id)
    {
        const loader = exampleById.get(id);

        if (loader)
        {
            await loader();
        }
    }
    else if (type === 'visual-test' && id)
    {
        const loader = visualTestById.get(id);

        if (loader)
        {
            const { runScene } = await import('./scenes/sceneRunner');
            const mod = await loader() as { scene: TestScene };
            const result = await runScene(mod.scene, rendererType);

            try
            {
                const bitmap = await createImageBitmap(result.canvas);

                window.parent.postMessage(
                    { type: 'scene-result', bitmap },
                    '*',
                    [bitmap],
                );
            }
            finally
            {
                result.renderer.destroy();
            }
        }
    }
}
catch (err: unknown)
{
    const message = err instanceof Error ? err.message : String(err);

    window.parent.postMessage({ type: 'scene-error', message }, '*');
}
