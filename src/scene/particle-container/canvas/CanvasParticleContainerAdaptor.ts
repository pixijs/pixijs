import { canvasUtils } from '../../../rendering/renderers/canvas/utils/canvasUtils';

import type { CanvasRenderer } from '../../../rendering/renderers/canvas/CanvasRenderer';
import type { ParticleContainer } from '../shared/ParticleContainer';
import type { ParticleContainerAdaptor, ParticleContainerPipe } from '../shared/ParticleContainerPipe';

/**
 * A Canvas adaptor for the ParticleContainer that renders particles using Canvas2D.
 * @internal
 */
export class CanvasParticleContainerAdaptor implements ParticleContainerAdaptor
{
    public execute(particleContainerPipe: ParticleContainerPipe, container: ParticleContainer)
    {
        const renderer = particleContainerPipe.renderer as CanvasRenderer;
        const context = renderer.canvasContext.activeContext;
        const children = container.particleChildren;
        const texture = container.texture;

        context.save();
        renderer.canvasContext.setContextTransform(container.worldTransform, container.roundPixels);
        renderer.canvasContext.setBlendMode(container.groupBlendMode);

        const groupColorAlpha = container.groupColorAlpha;
        const filterAlpha = (renderer.filter as { alphaMultiplier?: number } | null)?.alphaMultiplier ?? 1;
        const groupAlpha = (((groupColorAlpha >>> 24) & 0xFF) / 255) * filterAlpha;

        for (let i = 0; i < children.length; i++)
        {
            const particle = children[i];
            const pTexture = particle.texture || texture;

            if (!pTexture?.source?.resource) continue;

            const color = particle.color;
            const alpha = (((color >>> 24) & 0xFF) / 255) * groupAlpha;

            if (alpha <= 0) continue;

            const bgr = color & 0xFFFFFF;
            const tint = ((bgr & 0xFF) << 16) + (bgr & 0xFF00) + ((bgr >> 16) & 0xFF);

            let drawSource: CanvasImageSource = pTexture.source.resource as CanvasImageSource;

            if (tint !== 0xFFFFFF)
            {
                drawSource = canvasUtils.getTintedCanvas({ texture: pTexture }, tint) as CanvasImageSource;
            }

            const frame = pTexture.frame;
            const resolution = pTexture.source.resolution;

            const sx = frame.x * resolution;
            const sy = frame.y * resolution;
            const sw = frame.width * resolution;
            const sh = frame.height * resolution;

            context.globalAlpha = alpha;

            const dx = -particle.anchorX * frame.width;
            const dy = -particle.anchorY * frame.height;

            if (particle.rotation !== 0 || particle.scaleX !== 1 || particle.scaleY !== 1)
            {
                context.save();
                context.translate(particle.x, particle.y);
                context.rotate(particle.rotation);
                context.scale(particle.scaleX, particle.scaleY);
                context.drawImage(drawSource, sx, sy, sw, sh, dx, dy, frame.width, frame.height);
                context.restore();
            }
            else
            {
                context.drawImage(drawSource, sx, sy, sw, sh, particle.x + dx, particle.y + dy, frame.width, frame.height);
            }
        }

        context.restore();
    }
}
