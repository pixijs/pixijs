import { useCallback, useEffect, useState } from 'preact/hooks';

import type { PlaygroundState, RenderType, ViewMode } from '../types';

const defaults: PlaygroundState = {
    scene: null,
    renderer: 'webgl2',
    renderer2: 'webgpu',
    view: 'single',
    tab: 'tests',
    search: '',
    expanded: true,
};

function readUrl(): PlaygroundState
{
    const params = new URLSearchParams(window.location.search);

    return {
        scene: params.get('scene') ?? defaults.scene,
        renderer: (params.get('renderer') as RenderType) ?? defaults.renderer,
        renderer2: (params.get('renderer2') as RenderType) ?? defaults.renderer2,
        view: (params.get('view') as ViewMode) ?? defaults.view,
        tab: (params.get('tab') as PlaygroundState['tab']) ?? defaults.tab,
        search: params.get('search') ?? defaults.search,
        expanded: params.has('expanded') ? params.get('expanded') === '1' : defaults.expanded,
    };
}

function writeUrl(state: PlaygroundState): void
{
    const params = new URLSearchParams();

    if (state.scene) params.set('scene', state.scene);
    if (state.renderer !== defaults.renderer) params.set('renderer', state.renderer);
    if (state.renderer2 !== defaults.renderer2) params.set('renderer2', state.renderer2);
    if (state.view !== defaults.view) params.set('view', state.view);
    if (state.tab !== defaults.tab) params.set('tab', state.tab);
    if (state.search) params.set('search', state.search);
    if (!state.expanded) params.set('expanded', '0');

    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;

    history.replaceState(null, '', url);
}

export function useUrlState(): [PlaygroundState, (patch: Partial<PlaygroundState>) => void]
{
    const [state, setState] = useState<PlaygroundState>(readUrl);

    const update = useCallback((patch: Partial<PlaygroundState>) =>
    {
        setState((prev) =>
        {
            const next = { ...prev, ...patch };

            writeUrl(next);

            return next;
        });
    }, []);

    useEffect(() =>
    {
        const onPop = () => setState(readUrl());

        window.addEventListener('popstate', onPop);

        return () => window.removeEventListener('popstate', onPop);
    }, []);

    return [state, update];
}
