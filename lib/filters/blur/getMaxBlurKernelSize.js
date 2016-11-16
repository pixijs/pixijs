"use strict";

exports.__esModule = true;
exports.default = getMaxKernelSize;
function getMaxKernelSize(gl) {
    var maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
    var kernelSize = 15;

    while (kernelSize > maxVaryings) {
        kernelSize -= 2;
    }

    return kernelSize;
}
//# sourceMappingURL=getMaxBlurKernelSize.js.map