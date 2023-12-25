/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable newline-before-return */
/* eslint-disable newline-after-var */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
import { Application } from "../src/app/Application";
import { Assets } from "../src/assets/Assets";
import { Graphics } from "../src/scene/graphics/shared/Graphics";
import { Sprite } from "../src/scene/sprite/Sprite";

async function myTest() {
    const app = new Application();
    await app.init({
        width: 800,
        height: 800,
        backgroundColor: 0xff0000,
        preference: "webgl",
        autoDensity: true,
        resolution: window.devicePixelRatio,
    });
    document.body.appendChild(app.canvas);

    const g = new Graphics();
    g.rect(0, 0, 100, 100);
    g.fill({ color: 0xffff00 });
    g.position.set(100);
    app.stage.addChild(g);

    setTimeout(() => {
        const canvas = app.renderer.extract.canvas(g) as HTMLCanvasElement;
        document.body.appendChild(canvas);
    }, 1000);
}

myTest();
