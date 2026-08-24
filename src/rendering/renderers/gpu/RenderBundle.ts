/**
 * A recorded WebGPU render bundle, together with a stamp of the pipeline state it baked when it
 * was recorded.
 *
 * Recording captures the render target permanently, in two ways:
 *
 * - the attachment state (color format(s), depth/stencil format, sample count). WebGPU validates
 *   this when the bundle is executed — replaying it in a pass whose attachments differ rejects the
 *   whole command buffer.
 * - the front-face winding baked into every pipeline inside it. WebGPU does *not* validate this —
 *   replaying after the target's {@link RenderTarget.flipY} parity changed silently renders
 *   geometry inside out.
 *
 * {@link RenderBundle.stateKey} stamps both, so {@link GpuEncoderSystem.isBundleValid} can answer
 * whether a cached bundle is still safe to replay against the target that is bound now.
 *
 * Created by {@link GpuEncoderSystem.endBundle} — there is no reason to construct one yourself.
 * @example
 * ```ts
 * const record = () =>
 * {
 *     encoder.beginBundle('my-cached-pass');
 *     encoder.draw({ geometry, shader });
 *
 *     return encoder.endBundle();
 * };
 *
 * // record once, then replay on later frames — re-recording whenever the target it baked
 * // no longer matches the one bound now
 * if (!encoder.isBundleValid(bundle)) bundle = record();
 * encoder.executeBundle(bundle);
 * ```
 * @category rendering
 * @advanced
 */
export class RenderBundle
{
    /** The recorded native bundle, as handed to `GPURenderPassEncoder.executeBundles`. */
    public readonly gpuBundle: GPURenderBundle;
    /**
     * The value {@link PipelineSystem.bundleStateKey} had when recording began. Comparing it
     * against the pipeline's current key tells you whether this bundle still matches the bound
     * render target — which is exactly what {@link GpuEncoderSystem.isBundleValid} does.
     */
    public readonly stateKey: number;
    /** Optional debug label — names the bundle in GPU captures and in WebGPU validation errors. */
    public readonly label?: string;

    /**
     * @param gpuBundle - The recorded native render bundle.
     * @param stateKey - The pipeline state key captured when recording began.
     * @param label - Optional debug label for the bundle.
     */
    constructor(gpuBundle: GPURenderBundle, stateKey: number, label?: string)
    {
        this.gpuBundle = gpuBundle;
        this.stateKey = stateKey;
        this.label = label;
    }
}
