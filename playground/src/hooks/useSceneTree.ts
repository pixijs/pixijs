import { useMemo } from 'preact/hooks';

import type { SceneEntry, TreeFolder, TreeNode } from '../types';

const typeForTab: Record<string, string> = {
    playground: 'playground',
    examples: 'example',
    tests: 'visual-test',
};

export function useSceneTree(
    entries: SceneEntry[],
    tab: 'playground' | 'examples' | 'tests',
    search: string,
): TreeNode[]
{
    return useMemo(() =>
    {
        const sceneType = typeForTab[tab];
        const filtered = entries
            .filter((e) => e.type === sceneType)
            .filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase())
                || e.category.toLowerCase().includes(search.toLowerCase()));

        return buildTree(filtered);
    }, [entries, tab, search]);
}

function buildTree(entries: SceneEntry[]): TreeNode[]
{
    const root: TreeNode[] = [];

    for (const entry of entries)
    {
        const parts = entry.category.split('/');
        let current = root;

        for (const part of parts)
        {
            let folder = current.find(
                (n): n is TreeFolder => n.type === 'folder' && n.name === part
            );

            if (!folder)
            {
                folder = { type: 'folder', name: part, children: [] };
                current.push(folder);
            }

            current = folder.children;
        }

        current.push({ type: 'leaf', name: entry.name, entry });
    }

    // Sort: folders first, then alphabetical
    sortTree(root);

    return root;
}

function sortTree(nodes: TreeNode[]): void
{
    nodes.sort((a, b) =>
    {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;

        return a.name.localeCompare(b.name);
    });

    for (const node of nodes)
    {
        if (node.type === 'folder')
        {
            sortTree(node.children);
        }
    }
}
