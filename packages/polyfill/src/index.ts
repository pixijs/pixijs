import './Promise';
import './Object.assign';
import './requestAnimationFrame';
import './Math.sign';
import './Number.isInteger';

if (!self.ArrayBuffer)
{
    (self as any).ArrayBuffer = Array;
}

if (!self.Float32Array)
{
    (self as any).Float32Array = Array;
}

if (!self.Uint32Array)
{
    (self as any).Uint32Array = Array;
}

if (!self.Uint16Array)
{
    (self as any).Uint16Array = Array;
}

if (!self.Uint8Array)
{
    (self as any).Uint8Array = Array;
}

if (!self.Int32Array)
{
    (self as any).Int32Array = Array;
}
