import { Assets } from '../../../../src/assets/Assets';
import { AlphaFilter } from '../../../../src/filters/defaults/alpha/AlphaFilter';
import { Sprite } from '../../../../src/scene/sprite/Sprite';
import { basePath } from '../../../assets/basePath';

import type { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render sprite',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load<Texture>({
            src: `${basePath}textures/bunny.png`,
            data: {
                resolution: 1,
                width: 13,
                height: 19,
            }
        });
        const texture2 = await Assets.load<Texture>({
            src: `${basePath}textures/bunny.1.png`,
            data: {
                resolution: 1,
                width: 13,
                height: 19,
            }
        });
        const texture3 = await Assets.load<Texture>({
            src: `${basePath}textures/profile-abel@2x.jpg`,
            data: {
                resolution: 1,
                width: 128,
                height: 128,
            }
        });

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
