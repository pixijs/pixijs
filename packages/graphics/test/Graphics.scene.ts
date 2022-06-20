import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Graphics } from '@pixi/graphics';
import type { TestScene } from '../../../test/renderTests';
import { Texture } from '@pixi/core';

export const scene: TestScene = {
    it: 'should render several graphics',
    options: {
        width: 800,
        height: 600,
        backgroundColor: 0x0
    },
    create: async (scene: Container) =>
    {
        const tex = await Texture.fromURL('https://pixijs.io/examples/examples/assets/bg_rotate.jpg');
        const sprite = Sprite.from(tex);
        const realPath = new Graphics();

        realPath.lineStyle(2, 0xFFFFFF, 1);
        realPath.moveTo(0, 0);
        realPath.lineTo(100, 200);
        realPath.lineTo(200, 200);
        realPath.lineTo(240, 100);

        realPath.position.x = 50;
        realPath.position.y = 50;

        scene.addChild(realPath);

        const bezier = new Graphics();

        bezier.lineStyle(5, 0xAA0000, 1);
        bezier.bezierCurveTo(100, 200, 200, 200, 240, 100);

        bezier.position.x = 50;
        bezier.position.y = 50;

        scene.addChild(bezier);

        // // BEZIER CURVE 2 ////
        const realPath2 = new Graphics();

        realPath2.lineStyle(2, 0xFFFFFF, 1);
        realPath2.moveTo(0, 0);
        realPath2.lineTo(0, -100);
        realPath2.lineTo(150, 150);
        realPath2.lineTo(240, 100);

        realPath2.position.x = 320;
        realPath2.position.y = 150;

        scene.addChild(realPath2);

        const bezier2 = new Graphics();

        bezier2.lineTextureStyle({ width: 10, texture: sprite.texture });
        bezier2.bezierCurveTo(0, -100, 150, 150, 240, 100);

        bezier2.position.x = 320;
        bezier2.position.y = 150;

        scene.addChild(bezier2);

        // // ARC ////
        const arc = new Graphics();

        arc.lineStyle(5, 0xAA00BB, 1);
        arc.arc(600, 100, 50, Math.PI, 2 * Math.PI);

        scene.addChild(arc);

        // // ARC 2 ////
        const arc2 = new Graphics();

        arc2.lineStyle(6, 0x3333DD, 1);
        arc2.arc(650, 270, 60, 2 * Math.PI, 3 * Math.PI / 2);

        scene.addChild(arc2);

        // // ARC 3 ////
        const arc3 = new Graphics();

        arc3.lineTextureStyle({ width: 20, texture: sprite.texture });
        arc3.arc(650, 420, 60, 2 * Math.PI, 2.5 * Math.PI / 2);

        scene.addChild(arc3);

        // / Hole ////
        const rectAndHole = new Graphics();

        rectAndHole.beginFill(0x00FF00);
        rectAndHole.drawRect(350, 350, 150, 150);
        rectAndHole.beginHole();
        rectAndHole.drawCircle(375, 375, 25);
        rectAndHole.drawCircle(425, 425, 25);
        rectAndHole.drawCircle(475, 475, 25);
        rectAndHole.endHole();
        rectAndHole.endFill();

        scene.addChild(rectAndHole);

        // // Line Texture Style ////
        const beatifulRect = new Graphics();

        beatifulRect.lineTextureStyle({ width: 20, texture: sprite.texture });
        beatifulRect.beginFill(0xFF0000);
        beatifulRect.drawRect(80, 350, 150, 150);
        beatifulRect.endFill();

        scene.addChild(beatifulRect);
    },
};
