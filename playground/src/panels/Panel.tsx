import type { ComponentChildren } from 'preact';

interface PanelProps
{
    expanded: boolean;
    children: ComponentChildren;
}

export function Panel({ expanded, children }: PanelProps)
{
    return (
        <div style={{
            position: 'fixed',
            top: '50px',
            left: '10px',
            width: '280px',
            maxHeight: 'calc(100vh - 60px)',
            background: '#0c0c14',
            border: '1px solid #1a1a28',
            borderRadius: '8px',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            color: '#dcdce8',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            pointerEvents: expanded ? 'auto' : 'none',
            opacity: expanded ? 1 : 0,
            transform: expanded ? 'translateX(0)' : 'translateX(-16px)',
            transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
            {children}
        </div>
    );
}
