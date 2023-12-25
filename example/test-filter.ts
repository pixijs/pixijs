/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable newline-before-return */
/* eslint-disable newline-after-var */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
import { Application } from "../src/app/Application";
import { Assets } from "../src/assets/Assets";
import { Sprite } from "../src/scene/sprite/Sprite";
import { ColorMatrixFilter } from "../src/filters/defaults/color-matrix/ColorMatrixFilter";
import { Container } from "../src/scene/container/Container";
import { AdjustFilter } from "../src/filters/defaults/adjust/AdjustFilter";
import { AdjustFilter2 } from "../src/filters/defaults/adjust/AdjustPass2";
import { RenderTexture } from "../src/rendering/renderers/shared/texture/RenderTexture";
import { Texture } from "../src/rendering/renderers/shared/texture/Texture";
import { ImageSource } from "../src/rendering/renderers/shared/texture/sources/ImageSource";
import { NoiseFilter } from "../src/filters/defaults/noise/NoiseFilter";
import { BlurFilter } from "../src/filters/defaults/blur/BlurFilter";

async function myTest() {
    // analyzer();
    const app = new Application();

    await app.init({
        width: 1000,
        height: 1000,
        backgroundColor: 0xffffff,
        preference: "webgl",
        autoDensity: true,
        resolution: window.devicePixelRatio,
    });
    document.body.appendChild(app.canvas);

    const container = new Container();
    app.stage.addChild(container);

    const texture = await Assets.load("assets/boat2.jpeg");

    const sprite1 = Sprite.from(texture);
    sprite1.position.set(0, 0);
    // sprite1.width = 648;
    // sprite1.height = 431;
    container.addChild(sprite1);

    // const adjust = await Assets.load("assets/adjust.png");
    // const filter = new AdjustFilter({ mapTexture: adjust });
    // sprite1.filters = [filter];

    const color = new ColorMatrixFilter();
    color.brightness(0.5,true);
    sprite1.filters = [new BlurFilter(),color,new NoiseFilter(),]
}

myTest();
