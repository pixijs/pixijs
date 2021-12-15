import './Promise';
import './Object.assign';
import './requestAnimationFrame';
import './Math.sign';
import './Number.isInteger';

if (!(self || globalThis.self).ArrayBuffer)
{
    ((self || globalThis.self) as any).ArrayBuffer = Array;
}

if (!(self || globalThis.self).Float32Array)
{
    ((self || globalThis.self) as any).Float32Array = Array;
}

if (!(self || globalThis.self).Uint32Array)
{
    ((self || globalThis.self) as any).Uint32Array = Array;
}

if (!(self || globalThis.self).Uint16Array)
{
    ((self || globalThis.self) as any).Uint16Array = Array;
}

if (!(self || globalThis.self).Uint8Array)
{
    ((self || globalThis.self) as any).Uint8Array = Array;
}

if (!(self || globalThis.self).Int32Array)
{
    ((self || globalThis.self) as any).Int32Array = Array;
}
