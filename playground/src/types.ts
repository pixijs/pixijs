export type RenderType = 'webgl1' | 'webgl2' | 'webgpu' | 'canvas';

export type SceneType = 'playground' | 'visual-test' | 'example';

export interface SceneEntry
{
    id: string;
    path: string;
    category: string;
    name: string;
    type: SceneType;
}

export type ViewMode = 'single' | 'side-by-side' | 'diff';

export interface PlaygroundState
{
    scene: string | null;
    renderer: RenderType;
    renderer2: RenderType;
    view: ViewMode;
    tab: 'playground' | 'examples' | 'tests';
    search: string;
    expanded: boolean;
}

export interface TreeFolder
{
    type: 'folder';
    name: string;
    children: TreeNode[];
}

export interface TreeLeaf
{
    type: 'leaf';
    name: string;
    entry: SceneEntry;
}

export type TreeNode = TreeFolder | TreeLeaf;
