import { Assets } from '~/assets';
import { Rectangle } from '~/maths';
import { RenderTexture, Texture } from '~/rendering';
import { NineSliceSprite, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a trimmed nine-slice sprite without edge bleeding',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const buttonTex = await Assets.load('big-rect-button-border.png');
        const tw = buttonTex.width;
        const th = buttonTex.height;

        // Render the button into a larger RenderTexture to simulate an atlas
        // (frame != source size ensures TextureMatrix.isSimple = false)
        const pad = 10;
        const atlasW = tw + (pad * 2);
        const atlasH = th + (pad * 2);
        const atlas = RenderTexture.create({ width: atlasW, height: atlasH });

        const stamp = new Sprite(buttonTex);

        stamp.position.set(pad, pad);
        renderer.render({ target: atlas, container: stamp });

        // Create trimmed texture pointing at the button region within the atlas
        const trimmedTexture = new Texture({
            source: atlas.source,
            frame: new Rectangle(pad, pad, tw, th),
            orig: new Rectangle(0, 0, tw + (pad * 2), th + (pad * 2)),
            trim: new Rectangle(pad, pad, tw, th),
        });

        const sliceBorder = 26 * 2;

        const small = new NineSliceSprite({
            texture: trimmedTexture,
            leftWidth: sliceBorder,
            rightWidth: sliceBorder,
            topHeight: sliceBorder,
            bottomHeight: sliceBorder,
            width: 60,
            height: 60,
        });

        scene.addChild(small);

        const tall = new NineSliceSprite({
            texture: trimmedTexture,
            leftWidth: sliceBorder,
            rightWidth: sliceBorder,
            topHeight: sliceBorder,
            bottomHeight: sliceBorder,
            width: 60,
            height: 120,
        });

        tall.x = 64;
        scene.addChild(tall);
    },
};
