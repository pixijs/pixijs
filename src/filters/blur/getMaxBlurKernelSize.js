

let getMaxKernelSize = function(gl)
{
    let maxVaryings = ( gl.getParameter(gl.MAX_VARYING_VECTORS) );
    let kernelSize = 15;

    while(kernelSize > maxVaryings)
    {
       kernelSize -= 2;
    }

    return kernelSize;
};

module.exports = getMaxKernelSize;
