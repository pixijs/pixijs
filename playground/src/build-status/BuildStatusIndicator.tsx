import { useBuildStatus } from '../hooks/useBuildStatus';

import type { BuildStatus } from '../hooks/useBuildStatus';

interface StatusStyle { bg: string; color: string; border: string; icon: string; text: string; spin: boolean }

const STATUS_CONFIG: Record<BuildStatus, StatusStyle> = {
    compiling: {
        bg: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.2)',
        icon: '\u21bb', text: 'Compiling...', spin: true,
    },
    ready: {
        bg: 'rgba(52, 211, 153, 0.12)', color: '#34d399', border: 'rgba(52, 211, 153, 0.2)',
        icon: '\u2714', text: 'Ready', spin: false,
    },
    error: {
        bg: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.2)',
        icon: '\u26A0', text: 'Build Error', spin: false,
    },
};

export function BuildStatusIndicator()
{
    const status = useBuildStatus();
    const config = STATUS_CONFIG[status];

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '6px 10px',
            borderRadius: '6px',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: config.bg,
            color: config.color,
            border: `1px solid ${config.border}`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            pointerEvents: 'auto',
        }}>
            <span style={config.spin ? { display: 'inline-block', animation: 'spin 1s linear infinite' } : undefined}>
                {config.icon}
            </span>
            {config.text}
        </div>
    );
}
