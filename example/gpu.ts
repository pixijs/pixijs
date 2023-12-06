/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable func-names */
/* eslint-disable newline-before-return */
/* eslint-disable no-console */
/* eslint-disable newline-after-var */

export function analyzer() {
    const createShaderModule = GPUDevice.prototype.createShaderModule;
    GPUDevice.prototype.createShaderModule = function (
        descriptor: GPUShaderModuleDescriptor
    ): GPUShaderModule {
        console.log("===============Shader===============");
        console.log(descriptor.code);
        return createShaderModule.call(this, descriptor);
    };
}
