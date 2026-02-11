import { useEffect, useRef } from 'preact/hooks';

interface CanvasViewProps
{
    canvas: HTMLCanvasElement | null;
    label?: string;
}

export function CanvasView({ canvas, label }: CanvasViewProps)
{
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() =>
    {
        const el = containerRef.current;

        if (!el || !canvas) return undefined;

        el.innerHTML = '';
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';
        canvas.style.imageRendering = 'pixelated';
        el.appendChild(canvas);

        return () =>
        {
            if (el.contains(canvas))
            {
                el.removeChild(canvas);
            }
        };
    }, [canvas]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            animation: 'fadeIn 0.3s ease',
        }}>
            {label && (
                <span style={{
                    fontSize: '11px',
                    color: '#707088',
                    fontFamily: 'system-ui, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                    {label}
                </span>
            )}
            <div ref={containerRef} style={{ background: '#16161f', borderRadius: '4px', overflow: 'hidden' }} />
        </div>
    );
}
