/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable newline-before-return */
/* eslint-disable newline-after-var */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
import { Application } from "../src/app/Application";
import { Assets } from "../src/assets/Assets";
import { Container } from "../src/scene/container/Container";
import { Graphics } from "../src/scene/graphics/shared/Graphics";
import { Sprite } from "../src/scene/sprite/Sprite";

import type { Texture } from "../src/rendering/renderers/shared/texture/Texture";

const width = 1000;
const height = 1000;

async function myTest() {
    const app = new Application();

    await app.init({
        width,
        height,
        preference: "webgpu",
        autoDensity: true,
        resolution: window.devicePixelRatio,
    });
    document.body.appendChild(app.canvas);

    const texture = await Assets.load("assets/boat.jpeg");

    const count = 200;
    const maxLine = count / 10;
    for (let i = 0; i < count; i++) {
        const x = 50 * (i % maxLine) - 50;
        const y = 100 * Math.floor(i / maxLine);

        const sp = createSprite(texture, x, y);
        app.stage.addChild(sp);
    }

    const node = new Graphics();

    node.fillStyle = 0xffff00;
    node.rect(0, 0, 100, 100);
    node.fill();
    node.position.set(500, 500);
    app.stage.addChild(node);

    app.ticker.add(() => {
        node.angle++;
    });
}

function createSprite(texture: Texture, x: number, y: number) {
    const container = new Container();
    container.position.set(x, y);

    const image = Sprite.from(texture);
    image.scale.set(0.2 * Math.random() + 0.4);
    container.addChild(image);

    const mask = new Graphics();
    mask.fillStyle = 0xff0000;
    mask.moveTo(-100, 50);
    mask.lineTo(100, 50);
    mask.lineTo(0, 80);
    mask.circle(0, 0, 30 + 20 * Math.random());
    mask.fill();
    mask.position.set(100, 50);

    container.addChild(mask);
    container.mask = mask;

    return container;
}

myTest();
