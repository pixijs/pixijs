globalThis.requestAnimationFrame = function requestAnimationFrame(fn)
{
    return setTimeout(fn, 1000 / 60);
};

globalThis.cancelAnimationFrame = function cancelAnimationFrame(fn)
{
    return clearTimeout(fn);
};
