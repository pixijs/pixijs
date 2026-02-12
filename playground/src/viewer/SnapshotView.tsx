import { useEffect, useState } from 'preact/hooks';

import type { RenderType } from '../types';

interface SnapshotViewProps
{
    sceneId: string;
    renderer: RenderType;
}

export function SnapshotView({ sceneId, renderer }: SnapshotViewProps)
{
    const [src, setSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() =>
    {
        const url = `/snapshots/${sceneId}-${renderer}.png`;

        setError(false);
        setSrc(url);
    }, [sceneId, renderer]);

    if (error)
    {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '12px',
                fontFamily: 'system-ui, sans-serif',
                padding: '20px',
            }}>
                No snapshot found
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{
                fontSize: '11px',
                color: '#94a3b8',
                fontFamily: 'system-ui, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            }}>
                Snapshot ({renderer})
            </span>
            {src && (
                <img
                    src={src}
                    alt={`${sceneId} ${renderer} snapshot`}
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                        imageRendering: 'pixelated',
                        borderRadius: '4px',
                    }}
                    onError={() => setError(true)}
                />
            )}
        </div>
    );
}
