import { Assets } from '~/assets';
import { AlphaFilter } from '~/filters';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render sprite',
    create: async (scene: Container) =>
    {
        const textures = await Assets.load([
            `bunny.png`,
            'bunny.1.png',
            {
                src: `profile-abel@2x.jpg`,
                data: {
                    resolution: 1,
                }
            }
        ]);

        const texture = textures[`bunny.png`];
        const texture2 = textures[`bunny.1.png`];
        const texture3 = textures[`profile-abel@2x.jpg`];

        texture2.source.style.scaleMode = 'nearest';

        const spriteWithTextureConstructor = new Sprite(texture);
        const spriteWithTextureSetter = new Sprite();
        const spriteWithLinearScale = new Sprite(texture2);
        const spriteWithNearestScale = new Sprite(texture);
        const spriteWithTintRotation = new Sprite(texture);
        const spriteWithSkewPivot = new Sprite(texture);
        const spriteWithNon1Resolution = new Sprite(texture3);

        spriteWithTextureSetter.texture = texture;
        spriteWithTextureSetter.x = spriteWithTextureSetter.width;
        spriteWithTextureSetter.alpha = 0.5;

        spriteWithLinearScale.x = spriteWithTextureSetter.width * 2;
        spriteWithLinearScale.scale.set(3);

        const bounds1 = spriteWithLinearScale.getBounds();

        spriteWithNearestScale.x = bounds1.right;
        spriteWithNearestScale.scale.set(3);

        spriteWithTintRotation.anchor.set(0.5);
        spriteWithTintRotation.angle = 45;
        spriteWithTintRotation.tint = 0xff0000;
        spriteWithTintRotation.x = spriteWithTextureSetter.width;
        spriteWithTintRotation.y = spriteWithTextureSetter.height * 2;

        spriteWithSkewPivot.skew.set(0.2, 0.5);
        spriteWithSkewPivot.pivot.set(texture.width / 2, texture.height / 2);
        spriteWithSkewPivot.position.set(64, 64);
        spriteWithSkewPivot.scale.set(2);
        spriteWithSkewPivot.filters = [new AlphaFilter({ alpha: 0.5 })];

        spriteWithNon1Resolution.position.set(0, 64);
        spriteWithNon1Resolution.scale.set(0.5, 1);

        scene.addChild(spriteWithTextureConstructor);
        scene.addChild(spriteWithTextureSetter);
        scene.addChild(spriteWithLinearScale);
        scene.addChild(spriteWithNearestScale);
        scene.addChild(spriteWithTintRotation);
        scene.addChild(spriteWithNon1Resolution);
        scene.addChild(spriteWithSkewPivot);
    },
};
