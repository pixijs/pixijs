export function checkMaxSamplersInShader(maxSamplers, gl)
{
    if (maxSamplers === 0)
    {
        throw new Error('Invalid value of `0` passed to `checkMaxSamplersInShader`');
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    // Mesa drivers may crash with more than 16 samplers and Firefox
    // will actively refuse to create shaders with more than 16 samplers.
    if (renderer.slice(0, 4).toUpperCase() === 'MESA')
    {
        maxSamplers = Math.min(16, maxSamplers);
    }

    return maxSamplers;
}

