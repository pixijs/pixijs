import type { RenderType, SceneType, ViewMode } from '../types';

const RENDERERS: RenderType[] = ['webgl1', 'webgl2', 'webgpu', 'canvas'];
const RENDERER_LABELS: Record<RenderType, string> = {
    webgl1: 'GL1',
    webgl2: 'GL2',
    webgpu: 'GPU',
    canvas: 'Canvas',
};

function rendererBtnColor(enabled: boolean, active: boolean): string
{
    if (!enabled) return '#3a3a50';
    if (active) return '#fff';

    return '#707088';
}

const VIEW_MODES: { value: ViewMode; label: string }[] = [
    { value: 'single', label: '1' },
    { value: 'side-by-side', label: '2' },
    { value: 'diff', label: 'D' },
];

interface MiniBarProps
{
    sceneName: string | null;
    sceneType: SceneType | null;
    renderer: RenderType;
    renderer2: RenderType;
    view: ViewMode;
    expanded: boolean;
    enabledRenderers: Record<RenderType, boolean>;
    onRendererChange: (r: RenderType) => void;
    onRenderer2Change: (r: RenderType) => void;
    onViewChange: (v: ViewMode) => void;
    onToggleExpanded: () => void;
}

export function MiniBar({
    sceneName,
    sceneType,
    renderer,
    renderer2,
    view,
    expanded,
    enabledRenderers,
    onRendererChange,
    onRenderer2Change,
    onViewChange,
    onToggleExpanded,
}: MiniBarProps)
{
    const btnBase: Record<string, string | number> = {
        border: 'none',
        borderRadius: '4px',
        padding: '3px 6px',
        fontSize: '11px',
        cursor: 'pointer',
        fontFamily: 'system-ui, sans-serif',
        transition: 'background 0.15s ease, color 0.15s ease, opacity 0.15s ease',
    };

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '280px',
            boxSizing: 'border-box',
            padding: '6px 10px',
            background: 'rgba(12, 12, 20, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid #1a1a28',
            borderRadius: '8px',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            color: '#dcdce8',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            pointerEvents: 'auto',
        }}>
            {/* Toggle panel */}
            <button
                onClick={onToggleExpanded}
                style={{
                    ...btnBase,
                    background: expanded ? '#222230' : '#16161f',
                    color: '#dcdce8',
                    fontWeight: 'bold',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                }}
            >
                {expanded ? '\u2190' : '\u2192'}
            </button>

            {/* Scene name */}
            <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: sceneName ? '#dcdce8' : '#505068',
                maxWidth: '200px',
            }}>
                {sceneName ?? 'No scene selected'}
            </span>

            {/* Renderer / view controls (visual tests only) */}
            {sceneType === 'visual-test' && (<>
                <div style={{ width: '1px', alignSelf: 'stretch', background: '#262638' }} />
                <div style={{ display: 'flex', gap: '2px' }}>
                    {RENDERERS.map((r) => (
                        <button
                            key={r}
                            onClick={() => onRendererChange(r)}
                            disabled={!enabledRenderers[r]}
                            style={{
                                ...btnBase,
                                background: renderer === r ? '#E72264' : '#16161f',
                                color: rendererBtnColor(enabledRenderers[r], renderer === r),
                                cursor: enabledRenderers[r] ? 'pointer' : 'not-allowed',
                                opacity: enabledRenderers[r] ? 1 : 0.4,
                            }}
                        >
                            {RENDERER_LABELS[r]}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid #262638', paddingLeft: '8px' }}>
                    {VIEW_MODES.map((m) => (
                        <button
                            key={m.value}
                            onClick={() => onViewChange(m.value)}
                            style={{
                                ...btnBase,
                                background: view === m.value ? '#E72264' : '#16161f',
                                color: view === m.value ? '#fff' : '#707088',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                            }}
                            title={m.value}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {view !== 'single' && (
                    <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid #262638', paddingLeft: '8px' }}>
                        {RENDERERS.map((r) => (
                            <button
                                key={r}
                                onClick={() => onRenderer2Change(r)}
                                disabled={!enabledRenderers[r]}
                                style={{
                                    ...btnBase,
                                    background: renderer2 === r ? '#8b5cf6' : '#16161f',
                                    color: rendererBtnColor(enabledRenderers[r], renderer2 === r),
                                    cursor: enabledRenderers[r] ? 'pointer' : 'not-allowed',
                                    opacity: enabledRenderers[r] ? 1 : 0.4,
                                }}
                            >
                                {RENDERER_LABELS[r]}
                            </button>
                        ))}
                    </div>
                )}
            </>)}
        </div>
    );
}
