import { Assets } from '../../../../src/assets/Assets';
import { Container } from '../../../../src/scene/container/Container';
import { Culler } from '../../../../src/scene/Culler';
import { Sprite } from '../../../../src/scene/sprite/Sprite';
import { basePath } from '../../../assets/basePath';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render sprite',
    only: true,
    renderers: {
        canvas: true,
        webgl: true,
        webgpu: false,
    },
    create: async (scene: Container, renderer) =>
    {
        const texture = await Assets.load(`${basePath}textures/bunny.png`);
        const spriteWithTextureConstructor = new Sprite(texture);
        const spriteWithTextureSetter = new Sprite();

        const stage = new Container();
        const container = new Container();
        const c2 = new Container();
        const c3 = new Container();

        stage.addChild(container);
        container.addChild(c2, c3);
        c3.addChild(spriteWithTextureConstructor);
        c3.addChild(spriteWithTextureSetter);

        spriteWithTextureSetter.texture = texture;
        spriteWithTextureSetter.x = 100;

        scene.addChild(stage);

        container.removeChild(c2);
        container.addChild(c2);

        spriteWithTextureConstructor.cullable = true;
        spriteWithTextureSetter.cullable = true;
        c2.cullable = true;
        c3.cullable = true;
        container.cullable = true;
        stage.cullable = true;

        container.removeChild(c3);

        Culler.shared.cull(scene, renderer.screen);
    },
};
