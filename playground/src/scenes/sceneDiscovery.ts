import type { SceneEntry } from '../types';

const playgroundGlobs = import.meta.glob('../*.playground.ts');
const visualTestGlobs = import.meta.glob('../../../tests/visual/scenes/**/*.scene.ts');

function deriveId(filename: string): string
{
    return filename.toLowerCase().replaceAll('.', '-');
}

function basename(path: string): string
{
    return path.split('/').pop() ?? path;
}

function deriveCategory(path: string): string
{
    const parts = path.split('/');
    const scenesIdx = parts.indexOf('scenes');

    if (scenesIdx >= 0 && scenesIdx < parts.length - 2)
    {
        return parts.slice(scenesIdx + 1, -1).join('/');
    }

    return 'uncategorized';
}

export function discoverScenes(): SceneEntry[]
{
    const entries: SceneEntry[] = [];

    for (const path of Object.keys(playgroundGlobs))
    {
        const filename = basename(path);
        const name = filename.replace('.playground.ts', '');

        entries.push({
            id: name,
            path,
            category: 'playground',
            name,
            type: 'playground',
        });
    }

    for (const path of Object.keys(visualTestGlobs))
    {
        const filename = basename(path);
        const name = filename.replace('.scene.ts', '');
        const id = deriveId(filename);
        const category = deriveCategory(path);

        entries.push({
            id,
            path,
            category,
            name,
            type: 'visual-test',
        });
    }

    return entries;
}
