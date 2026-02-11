import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { BuildStatusIndicator } from '../build-status/BuildStatusIndicator';
import { useSceneTree } from '../hooks/useSceneTree';
import { useUrlState } from '../hooks/useUrlState';
import { MiniBar } from '../panels/MiniBar';
import { Panel } from '../panels/Panel';
import { TreeView } from '../panels/TreeView';
import { discoverScenes } from '../scenes/sceneDiscovery';
import { Viewer } from '../viewer/Viewer';

import type { RenderType, SceneEntry } from '../types';

export function App()
{
    const [state, update] = useUrlState();
    const allScenes = useMemo(() => discoverScenes(), []);
    const tree = useSceneTree(allScenes, state.tab, state.search);

    const selectedEntry = useMemo(
        () => allScenes.find((e) => e.id === state.scene) ?? null,
        [allScenes, state.scene],
    );

    // Load playground scenes in an isolated iframe
    useEffect(() =>
    {
        if (selectedEntry?.type !== 'playground') return undefined;

        const iframe = document.createElement('iframe');

        iframe.id = 'playground-frame';
        iframe.src = `/scene-frame.html?type=playground&id=${encodeURIComponent(selectedEntry.id)}`;
        iframe.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;border:none;z-index:0;';
        document.body.appendChild(iframe);

        return () => { iframe.remove(); };
    }, [selectedEntry]);

    const handleSelect = useCallback((entry: SceneEntry) =>
    {
        update({ scene: entry.id });
    }, [update]);

    const enabledRenderers = useMemo(
        () => ({ webgl1: true, webgl2: true, webgpu: true, canvas: true }) as Record<RenderType, boolean>,
        [],
    );

    return (
        <>
            {/* All UI is position:fixed, floating above whatever the page renders */}
            <MiniBar
                sceneName={selectedEntry?.name ?? null}
                sceneType={selectedEntry?.type ?? null}
                renderer={state.renderer}
                renderer2={state.renderer2}
                view={state.view}
                expanded={state.expanded}
                enabledRenderers={enabledRenderers}
                onRendererChange={(r) => update({ renderer: r })}
                onRenderer2Change={(r) => update({ renderer2: r })}
                onViewChange={(v) => update({ view: v })}
                onToggleExpanded={() => update({ expanded: !state.expanded })}
            />

            <Panel expanded={state.expanded}>
                <TreeView
                    nodes={tree}
                    selectedId={state.scene}
                    tab={state.tab}
                    search={state.search}
                    onSelect={handleSelect}
                    onTabChange={(tab) => update({ tab })}
                    onSearchChange={(search) => update({ search })}
                />
            </Panel>

            {/* Visual test viewer portals into #viewer (page-level, under UI) */}
            <Viewer
                entry={selectedEntry}
                renderer={state.renderer}
                renderer2={state.renderer2}
                view={state.view}
            />

            <BuildStatusIndicator />

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .scene-tree-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #262638 transparent;
                }
                .scene-tree-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .scene-tree-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scene-tree-scroll::-webkit-scrollbar-thumb {
                    background: #262638;
                    border-radius: 3px;
                }
                .scene-tree-scroll::-webkit-scrollbar-thumb:hover {
                    background: #3a3a50;
                }
            `}</style>
        </>
    );
}
