import { useState } from 'preact/hooks';

import type { SceneEntry, TreeFolder, TreeNode } from '../types';

interface TreeViewProps
{
    nodes: TreeNode[];
    selectedId: string | null;
    tab: 'examples' | 'tests';
    search: string;
    onSelect: (entry: SceneEntry) => void;
    onTabChange: (tab: 'examples' | 'tests') => void;
    onSearchChange: (search: string) => void;
}

export function TreeView({ nodes, selectedId, tab, search, onSelect, onTabChange, onSearchChange }: TreeViewProps)
{
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: '1 1 auto' }}>
            {/* Tab toggle */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #1a1a28',
            }}>
                <TabButton
                    active={tab === 'examples'}
                    onClick={() => onTabChange('examples')}
                >
                    Examples
                </TabButton>
                <TabButton
                    active={tab === 'tests'}
                    onClick={() => onTabChange('tests')}
                >
                    Visual Tests
                </TabButton>
            </div>

            {/* Search */}
            <div style={{ padding: '8px' }}>
                <input
                    type="text"
                    value={search}
                    onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
                    placeholder="Search scenes..."
                    style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #262638',
                        borderRadius: '4px',
                        background: '#16161f',
                        color: '#dcdce8',
                        fontSize: '12px',
                        fontFamily: 'system-ui, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onFocus={(e) =>
                    {
                        (e.target as HTMLElement).style.borderColor = 'rgba(231, 34, 100, 0.4)';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 2px rgba(231, 34, 100, 0.1)';
                    }}
                    onBlur={(e) =>
                    {
                        (e.target as HTMLElement).style.borderColor = '#262638';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                    }}
                />
            </div>

            {/* Tree */}
            <div
                class="scene-tree-scroll"
                style={{
                    flex: '1 1 auto',
                    minHeight: 0,
                    overflow: 'auto',
                    padding: '0 4px 8px',
                }}
            >
                {nodes.length === 0 ? (
                    <div style={{ color: '#505068', fontSize: '12px', padding: '8px', textAlign: 'center' }}>
                        No scenes found
                    </div>
                ) : (
                    <TreeNodes nodes={nodes} selectedId={selectedId} onSelect={onSelect} depth={0} />
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string })
{
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                background: 'none',
                color: active ? '#E72264' : '#505068',
                borderBottom: active ? '2px solid #E72264' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: active ? 600 : 400,
                transition: 'color 0.2s ease, border-color 0.2s ease',
            }}
        >
            {children}
        </button>
    );
}

function TreeNodes({ nodes, selectedId, onSelect, depth }: {
    nodes: TreeNode[];
    selectedId: string | null;
    onSelect: (entry: SceneEntry) => void;
    depth: number;
})
{
    return (
        <>
            {nodes.map((node) => (
                node.type === 'folder'
                    ? (
                        <FolderNode
                            key={node.name}
                            folder={node}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            depth={depth}
                        />
                    )
                    : (
                        <LeafNode
                            key={node.entry.id}
                            name={node.name}
                            entry={node.entry}
                            selected={node.entry.id === selectedId}
                            onSelect={onSelect}
                            depth={depth}
                        />
                    )
            ))}
        </>
    );
}

function FolderNode({ folder, selectedId, onSelect, depth }: {
    folder: TreeFolder;
    selectedId: string | null;
    onSelect: (entry: SceneEntry) => void;
    depth: number;
})
{
    const [open, setOpen] = useState(true);

    return (
        <div>
            <div
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 6px',
                    paddingLeft: `${(depth * 12) + 6}px`,
                    cursor: 'pointer',
                    color: '#808098',
                    fontSize: '12px',
                    borderRadius: '3px',
                    userSelect: 'none',
                    transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) =>
                {
                    (e.currentTarget as HTMLElement).style.background = '#1a1a28';
                }}
                onMouseLeave={(e) =>
                {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
            >
                <span style={{
                    fontSize: '10px',
                    transform: open ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'inline-block',
                }}>
                    {'\u25B6'}
                </span>
                {folder.name}
                <span style={{ color: '#3a3a50', fontSize: '10px', marginLeft: 'auto' }}>
                    {countLeaves(folder)}
                </span>
            </div>
            {open && (
                <TreeNodes
                    nodes={folder.children}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    depth={depth + 1}
                />
            )}
        </div>
    );
}

function LeafNode({ name, entry, selected, onSelect, depth }: {
    name: string;
    entry: SceneEntry;
    selected: boolean;
    onSelect: (entry: SceneEntry) => void;
    depth: number;
})
{
    return (
        <div
            onClick={() => onSelect(entry)}
            style={{
                padding: '3px 6px',
                paddingLeft: `${(depth * 12) + 20}px`,
                cursor: 'pointer',
                color: selected ? '#E72264' : '#a0a0b6',
                background: selected ? 'rgba(231, 34, 100, 0.08)' : 'transparent',
                fontSize: '12px',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) =>
            {
                if (!selected) (e.currentTarget as HTMLElement).style.background = '#1a1a28';
            }}
            onMouseLeave={(e) =>
            {
                if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
        >
            {name}
        </div>
    );
}

function countLeaves(folder: TreeFolder): number
{
    let count = 0;

    for (const child of folder.children)
    {
        if (child.type === 'leaf') count++;
        else count += countLeaves(child);
    }

    return count;
}
