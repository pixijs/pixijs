import './Promise';
import './Object.assign';
import './requestAnimationFrame';
import './Math.sign';
import './Number.isInteger';

if (!globalThis.ArrayBuffer)
{
    (globalThis as any).ArrayBuffer = Array;
}

if (!globalThis.Float32Array)
{
    (globalThis as any).Float32Array = Array;
}

if (!globalThis.Uint32Array)
{
    (globalThis as any).Uint32Array = Array;
}

if (!globalThis.Uint16Array)
{
    (globalThis as any).Uint16Array = Array;
}

if (!globalThis.Uint8Array)
{
    (globalThis as any).Uint8Array = Array;
}

if (!globalThis.Int32Array)
{
    (globalThis as any).Int32Array = Array;
}
