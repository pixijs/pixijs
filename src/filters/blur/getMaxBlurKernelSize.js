

var getMaxKernelSize = function(gl)
{
    var maxVaryings = ( gl.getParameter(gl.MAX_VARYING_VECTORS) / 2 ) | 0;
    var kernelSize = 11;
    
    while(kernelSize > maxVaryings)
    {
       kernelSize -= 2; 
    }

    return kernelSize;
}

module.exports = getMaxKernelSize;