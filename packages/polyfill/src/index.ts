import './Promise';
import './Object.assign';
import './requestAnimationFrame';
import './Math.sign';
import './Number.isInteger';

if (!window.ArrayBuffer)
{
    (window as any).ArrayBuffer = Array;
}

if (!window.Float32Array)
{
    (window as any).Float32Array = Array;
}

if (!window.Uint32Array)
{
    (window as any).Uint32Array = Array;
}

if (!window.Uint16Array)
{
    (window as any).Uint16Array = Array;
}

if (!window.Uint8Array)
{
    (window as any).Uint8Array = Array;
}

if (!window.Int32Array)
{
    (window as any).Int32Array = Array;
}
