import pixelmatch from 'pixelmatch';
import { useEffect, useRef, useState } from 'preact/hooks';

interface DiffViewProps
{
    canvasA: HTMLCanvasElement | null;
    canvasB: HTMLCanvasElement | null;
    labelA?: string;
    labelB?: string;
}

function getImageDataResized(canvas: HTMLCanvasElement, w: number, h: number): ImageData
{
    const tmp = document.createElement('canvas');

    tmp.width = w;
    tmp.height = h;

    const ctx = tmp.getContext('2d')!;

    ctx.drawImage(canvas, 0, 0);

    return ctx.getImageData(0, 0, w, h);
}

export function DiffView({ canvasA, canvasB, labelA, labelB }: DiffViewProps)
{
    const diffRef = useRef<HTMLCanvasElement>(null);
    const [mismatch, setMismatch] = useState<number | null>(null);

    useEffect(() =>
    {
        if (!canvasA || !canvasB || !diffRef.current) return;

        const w = Math.max(canvasA.width, canvasB.width);
        const h = Math.max(canvasA.height, canvasB.height);

        const dataA = getImageDataResized(canvasA, w, h);
        const dataB = getImageDataResized(canvasB, w, h);

        const diffCanvas = diffRef.current;

        diffCanvas.width = w;
        diffCanvas.height = h;

        const diffCtx = diffCanvas.getContext('2d')!;
        const diffData = diffCtx.createImageData(w, h);

        const count = pixelmatch(
            new Uint8ClampedArray(dataA.data.buffer),
            new Uint8ClampedArray(dataB.data.buffer),
            new Uint8ClampedArray(diffData.data.buffer),
            w,
            h,
            { threshold: 0.2 },
        );

        diffCtx.putImageData(diffData, 0, 0);
        setMismatch(count);
    }, [canvasA, canvasB]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            animation: 'fadeIn 0.3s ease',
        }}>
            <span style={{
                fontSize: '11px',
                color: '#707088',
                fontFamily: 'system-ui, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            }}>
                Diff {labelA && labelB ? `(${labelA} vs ${labelB})` : ''}
                {mismatch !== null && ` - ${mismatch}px`}
            </span>
            <canvas
                ref={diffRef}
                style={{
                    maxWidth: '100%',
                    height: 'auto',
                    imageRendering: 'pixelated',
                    borderRadius: '4px',
                    background: '#16161f',
                }}
            />
        </div>
    );
}
