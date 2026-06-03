/**
 * Optional WebGPU capabilities probed at adapter/device init.
 *
 * Mirrors the WebGL renderer's {@link WebGLExtensions} pattern: each entry represents a
 * feature, usage bit, or extension that may or may not be present in the current browser /
 * adapter, and the renderer can check it at runtime before opting in.
 * @category rendering
 * @advanced
 */
export interface GpuExtensions
{
    /**
     * `GPUTextureUsage.TRANSIENT_ATTACHMENT` (0x40) — when true, MSAA attachments can be
     * marked transient so TBDR drivers keep contents in tile memory and skip DRAM
     * allocation entirely. Not part of WebGPU 1.0; gated on the bit being present on
     * the `GPUTextureUsage` enum at runtime.
     */
    transientAttachment: boolean;
}
