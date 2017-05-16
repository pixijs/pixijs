function getWebGLContextClass()
{
    try
    {
        return window.WebGLRenderingContext || {};
    }
    catch (e)
    {
        return {};
    }
}

export const WebGLRenderingContext = getWebGLContextClass();
