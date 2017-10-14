import './Object.assign';
import './requestAnimationFrame';
import './Math.sign';

const root = typeof window === 'undefined' ? global : window

if (!root.ArrayBuffer)
{
    root.ArrayBuffer = Array;
}

if (!root.Float32Array)
{
    root.Float32Array = Array;
}

if (!root.Uint32Array)
{
    root.Uint32Array = Array;
}

if (!root.Uint16Array)
{
    root.Uint16Array = Array;
}
