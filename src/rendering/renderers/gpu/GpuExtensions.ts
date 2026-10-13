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
    /**
     * The GPU renders in tiles of on-chip memory (every phone GPU and Apple silicon), judged from
     * `adapter.info.vendor`. On these, writing a multisample buffer out to memory and reading it back costs far
     * more than restoring it from its resolved image, so PixiJS never stores MSAA colour on them and restores
     * it when a pass reopens the target. Other GPUs keep MSAA in video memory, where reopening is nearly free,
     * so they store it as before. An unknown vendor counts as not tile-based.
     */
    tileBased: boolean;
}
