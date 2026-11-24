import { loadTextureFile } from './swatches';
import { MeshPlane, NineSliceSprite, Particle, ParticleContainer, Sprite, TilingSprite } from '~/scene';
import { Spritesheet } from '~/spritesheet';

import type { TestScene } from '../../../types';
import type { TextureFile } from './textureFiles';
import type { Texture } from '~/rendering';
import type { Container } from '~/scene';

/** A 44x28 atlas of 8x8 ASTC blocks, which the loader pads to 48x32 */
export const atlas: TextureFile = { format: 'astc-8x8-unorm', width: 44, height: 28, levels: 1 };

/** Atlas frames in pixels; all but `tl` touch the right or bottom edge of the image, next to the padding */
export const frames: Record<string, { x: number, y: number, w: number, h: number }> = {
    tl: { x: 0, y: 0, w: 8, h: 8 },
    tr: { x: 36, y: 0, w: 8, h: 8 },
    bl: { x: 0, y: 20, w: 8, h: 8 },
    br: { x: 36, y: 20, w: 8, h: 8 },
    wide: { x: 4, y: 10, w: 40, h: 8 },
};

/** Where each object is drawn */
export const layout = {
    sprite: { x: 2, y: 2 },
    // tl, tr, bl and br at twice their size, 18 apart, then wide
    frames: { x: 50, y: 2 },
    tiling: { x: 2, y: 34, width: 100, height: 40 },
    nineSlice: { x: 106, y: 34, width: 60, height: 40, border: 8 },
    mesh: { x: 2, y: 78 },
    particles: { x: 94, y: 78, frameX: 142 },
    // br and tr of the atlas loaded at resolution 2, at four times their size
    retinaFrames: { x: 162, y: 78 },
};

const sheetData = (scale: number): ConstructorParameters<typeof Spritesheet>[1] => ({
    frames: Object.fromEntries(Object.entries(frames).map(([name, frame]) => [name, { frame }])),
    meta: { scale },
});

export const scene: TestScene = {
    it: 'should draw a padded compressed atlas through sprites, spritesheet frames, tiling, nine-slice, mesh and particles',
    excludeRenderers: ['canvas'],
    options: { width: 206, height: 136 },
    create: async (scene: Container) =>
    {
        const texture = await loadTextureFile(atlas);
        const sheet = new Spritesheet(texture, sheetData(1));
        const textures: Record<string, Texture> = await sheet.parse();

        const sprite = new Sprite(texture);

        sprite.position.set(layout.sprite.x, layout.sprite.y);
        scene.addChild(sprite);

        ['tl', 'tr', 'bl', 'br', 'wide'].forEach((name, i) =>
        {
            const frame = new Sprite(textures[name]);

            frame.position.set(layout.frames.x + (i * 18), layout.frames.y);
            frame.scale.set(2);
            scene.addChild(frame);
        });

        const tiling = new TilingSprite({ texture, width: layout.tiling.width, height: layout.tiling.height });

        tiling.position.set(layout.tiling.x, layout.tiling.y);

        const { border } = layout.nineSlice;
        const nineSlice = new NineSliceSprite({
            texture,
            leftWidth: border,
            topHeight: border,
            rightWidth: border,
            bottomHeight: border,
            width: layout.nineSlice.width,
            height: layout.nineSlice.height,
        });

        nineSlice.position.set(layout.nineSlice.x, layout.nineSlice.y);

        const mesh = new MeshPlane({ texture, verticesX: 3, verticesY: 3 });

        mesh.position.set(layout.mesh.x, layout.mesh.y);
        mesh.scale.set(2);

        const particles = new ParticleContainer({ texture });

        particles.addParticle(new Particle({ texture, x: layout.particles.x, y: layout.particles.y }));
        particles.addParticle(new Particle({
            texture: textures.br, x: layout.particles.frameX, y: layout.particles.y, scaleX: 2, scaleY: 2,
        }));

        const retinaTexture = await loadTextureFile(atlas, { resolution: 2 });
        const retinaTextures: Record<string, Texture> = await new Spritesheet(retinaTexture, sheetData(2)).parse();

        ['br', 'tr'].forEach((name, i) =>
        {
            const frame = new Sprite(retinaTextures[name]);

            frame.position.set(layout.retinaFrames.x + (i * 18), layout.retinaFrames.y);
            frame.scale.set(4);
            scene.addChild(frame);
        });

        scene.addChild(tiling, nineSlice, mesh, particles);
    },
};
