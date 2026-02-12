import { useEffect, useRef, useState } from 'preact/hooks';

import type { RenderType, SceneEntry } from '../types';

export interface SceneRenderResult
{
    canvas: HTMLCanvasElement | null;
    loading: boolean;
    error: string | null;
}

export function useIframeScene(
    entry: SceneEntry | null,
    rendererType: RenderType,
): SceneRenderResult
{
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useEffect(() =>
    {
        if (!entry || entry.type !== 'visual-test')
        {
            setCanvas(null);
            setError(null);
            setLoading(false);

            return undefined;
        }

        setLoading(true);
        setError(null);

        const iframe = document.createElement('iframe');

        iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;opacity:0;pointer-events:none;';
        iframe.src = `/scene-frame.html?type=visual-test&id=${encodeURIComponent(entry.id)}&renderer=${rendererType}`;
        document.body.appendChild(iframe);
        iframeRef.current = iframe;

        const onMessage = (e: MessageEvent) =>
        {
            if (e.source !== iframe.contentWindow) return;

            if (e.data.type === 'scene-result')
            {
                const bitmap = e.data.bitmap as ImageBitmap;
                const c = document.createElement('canvas');

                c.width = bitmap.width;
                c.height = bitmap.height;
                c.getContext('2d')!.drawImage(bitmap, 0, 0);
                bitmap.close();
                setCanvas(c);
                setLoading(false);
            }
            else if (e.data.type === 'scene-error')
            {
                setError(e.data.message);
                setCanvas(null);
                setLoading(false);
            }
        };

        window.addEventListener('message', onMessage);

        return () =>
        {
            window.removeEventListener('message', onMessage);

            if (iframeRef.current)
            {
                iframeRef.current.remove();
                iframeRef.current = null;
            }
        };
    }, [entry, rendererType]);

    return { canvas, loading, error };
}
