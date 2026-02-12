import { createPortal } from 'preact/compat';
import { useIframeScene } from '../hooks/useIframeScene';
import { CanvasView } from './CanvasView';
import { DiffView } from './DiffView';

import type { RenderType, SceneEntry, ViewMode } from '../types';

interface ViewerProps
{
    entry: SceneEntry | null;
    renderer: RenderType;
    renderer2: RenderType;
    view: ViewMode;
}

const viewerRoot = document.getElementById('viewer')!;

const errorStyle: Record<string, string> = {
    color: '#f43f5e',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '8px',
    whiteSpace: 'pre-wrap',
    maxWidth: '400px',
    overflow: 'auto',
};

export function Viewer({ entry, renderer, renderer2, view }: ViewerProps)
{
    const result1 = useIframeScene(entry, renderer);
    const result2 = useIframeScene(
        entry && view !== 'single' ? entry : null,
        renderer2,
    );

    if (!entry || entry.type !== 'visual-test') return null;

    const content = (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
        }}>
            {/* Primary renderer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                {result1.loading && <Spinner />}
                {result1.error && <div style={errorStyle}>{result1.error}</div>}
                {result1.canvas && <CanvasView canvas={result1.canvas} label={renderer} />}
            </div>

            {/* Second renderer (side-by-side or diff) */}
            {view !== 'single' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {result2.loading && <Spinner />}
                    {result2.error && <div style={errorStyle}>{result2.error}</div>}
                    {result2.canvas && <CanvasView canvas={result2.canvas} label={renderer2} />}
                </div>
            )}

            {/* Diff canvas */}
            {view === 'diff' && result1.canvas && result2.canvas && (
                <DiffView
                    canvasA={result1.canvas}
                    canvasB={result2.canvas}
                    labelA={renderer}
                    labelB={renderer2}
                />
            )}
        </div>
    );

    return createPortal(content, viewerRoot);
}

function Spinner()
{
    return (
        <div style={{
            color: '#707088',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            padding: '8px',
        }}>
            Loading...
        </div>
    );
}
